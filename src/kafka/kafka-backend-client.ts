import { Environment, KafkaAuthenticationMethod } from "../models/environments";
import {
  DisconnectReason,
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopic,
  MessageFromServer,
  MessageFromServerType,
  PartitionOffsets,
} from "./message-from-server";
import {
  MessageFromClient,
  MessageFromClientType,
  RequestConnect,
  RequestDisconnect,
  SubscribeToOffsetsOfConsumerGroup,
  SubscribeToOffsetsOfTopic,
  SubscribeToRecordsOfTopic,
  UnsubscribeFromOffsetsOfConsumerGroup,
  UnsubscribeFromOffsetsOfTopic,
  UnsubscribeFromRecordsOfTopic,
} from "./message-from-client";
import { spawnBackendProcess } from "./backend-process";

export interface BackendProcessLogEntry {
  type: "log" | "error";
  message: string;
}

export interface KafkaClientCallbacks {
  onBackendStarting: () => void;
  onReadyToConnect: () => void;
  onConnectedToEnvironment: (environmentId: string) => void;
  onConnectingToEnvironment: (environmentId: string) => void;
  onFailedToConnect: (environmentId: string) => void;
  onUnexpectedError: (error: string) => void;
  onRefreshTopics: (topics: KafkaTopic[]) => void;
  onRefreshConsumerGroups: (consumerGroups: KafkaConsumerGroup[]) => void;
  onRefreshTopicOffsets: (topicOffsets: PartitionOffsets[]) => void;
  onRecordsReceived: (records: KafkaRecord[]) => void;
  onSubscribedToRecordsOfTopic: (topic: string) => void;
  onUnsubscribedFromRecordsOfTopic: (topic: string) => void;
  onBackendProcessLog: (entries: BackendProcessLogEntry[]) => void;
}

export class KafkaBackendClient {
  private ws: WebSocket | null = null;
  private callbacks: KafkaClientCallbacks | null = null;
  private backendProcessLogBuffer: BackendProcessLogEntry[] = [];

  public async init(callbacks: KafkaClientCallbacks) {
    this.callbacks = callbacks;
    this.callbacks.onBackendStarting();

    try {
      const backend = await spawnBackendProcess(37452);

      backend.stdout.on("data", (message) => {
        this.backendProcessLogBuffer.push({
          type: "log",
          message: message.toString(),
        });
      });

      backend.stderr.on("data", (message) => {
        this.backendProcessLogBuffer.push({
          type: "error",
          message: message.toString(),
        });
      });

      backend.on("exit", (exitCode) => {
        callbacks.onUnexpectedError("Backend exited with code " + exitCode);
      });

      backend.on("close", (exitCode) => {
        callbacks.onUnexpectedError("Backend exited with code " + exitCode);
      });
    } catch (e) {
      callbacks.onUnexpectedError(
        "Failed to start backend process: " + e.toString()
      );
      return;
    }

    const ws = new WebSocket("ws://localhost:37452");

    ws.onopen = () => {
      console.log("WebSocket connection with backend established");
      this.ws = ws;
      callbacks.onReadyToConnect();
    };

    ws.onclose = () => {
      console.error("WebSocket connection with backend was closed");
      this.ws = null;
      callbacks.onUnexpectedError("WebSocket connection with backend closed");
    };

    ws.onmessage = (event) => {
      this.receiveMessageFromServer(JSON.parse(event.data));
    };

    // We flush backend process logs periodically, as it can cause problems
    // if we spam Overmind with every single log entry separately. Especially
    // when backend connects to Kafka, it can produce a lot of logs which can
    // delay more important state updates from happening.
    setInterval(() => {
      if (this.backendProcessLogBuffer.length > 0) {
        callbacks.onBackendProcessLog(this.backendProcessLogBuffer);
        this.backendProcessLogBuffer = [];
      }
    }, 500);
  }

  private receiveMessageFromServer(messageFromServer: MessageFromServer) {
    if (!this.ws || !this.callbacks) {
      throw new Error("WebSocket connection with backend is not open");
    }

    console.log(
      `Received message from backend: ${JSON.stringify(messageFromServer)}`
    );

    switch (messageFromServer.type) {
      case MessageFromServerType.STATUS_CONNECTED:
        this.callbacks.onConnectedToEnvironment(
          messageFromServer.environmentId
        );
        return;
      case MessageFromServerType.STATUS_CONNECTING:
        this.callbacks.onConnectingToEnvironment(
          messageFromServer.environmentId
        );
        return;
      case MessageFromServerType.STATUS_FAILED_TO_CONNECT:
        this.callbacks.onFailedToConnect(messageFromServer.environmentId);
        return;
      case MessageFromServerType.STATUS_DISCONNECTED:
        if (
          messageFromServer.reason ===
          DisconnectReason.CLIENT_REQUESTED_DISCONNECT
        ) {
          this.callbacks.onReadyToConnect();
          return;
        }

        this.callbacks.onUnexpectedError(
          "Backend client disconnected with the following reason: " +
            messageFromServer.reason
        );
        return;
      case MessageFromServerType.REFRESH_TOPICS:
        this.callbacks.onRefreshTopics(messageFromServer.topics);
        return;
      case MessageFromServerType.REFRESH_CONSUMER_GROUPS:
        this.callbacks.onRefreshConsumerGroups(
          messageFromServer.consumerGroups
        );
        return;
      case MessageFromServerType.REFRESH_TOPIC_OFFSETS:
        this.callbacks.onRefreshTopicOffsets(messageFromServer.offsets);
        return;
      case MessageFromServerType.SUBSCRIBED_TO_RECORDS_OF_TOPIC:
        this.callbacks.onSubscribedToRecordsOfTopic(messageFromServer.topic);
        return;
      case MessageFromServerType.UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC:
        this.callbacks.onUnsubscribedFromRecordsOfTopic(
          messageFromServer.topic
        );
        return;
      case MessageFromServerType.RECEIVE_RECORDS:
        this.callbacks.onRecordsReceived(messageFromServer.records);
        return;
    }
  }

  private send(message: MessageFromClient) {
    if (!this.ws) {
      throw new Error("WebSocket connection with backend is not open");
    }

    const serializedMessage = JSON.stringify(message);
    console.log(`Sending to backend: ${serializedMessage}`);
    this.ws.send(serializedMessage);
  }

  public connect(environment: Environment) {
    const message: RequestConnect = {
      type: MessageFromClientType.REQUEST_CONNECT,
      environmentId: environment.id,
      brokers: environment.brokers.split(","),
      authenticationStrategy: environment.authentication.method,
      username:
        environment.authentication.method ===
        KafkaAuthenticationMethod.SASL_PLAIN
          ? environment.authentication.username
          : undefined,
      password:
        environment.authentication.method ===
        KafkaAuthenticationMethod.SASL_PLAIN
          ? environment.authentication.password
          : undefined,
    };

    this.send(message);
  }

  public disconnect() {
    const message: RequestDisconnect = {
      type: MessageFromClientType.REQUEST_DISCONNECT,
    };

    this.send(message);
  }

  public subscribeToRecordsOfTopic(topic: string) {
    const message: SubscribeToRecordsOfTopic = {
      type: MessageFromClientType.SUBSCRIBE_TO_RECORDS_OF_TOPIC,
      topic,
    };

    this.send(message);
  }

  public unsubscribeFromRecordsOfTopic(topic: string) {
    const message: UnsubscribeFromRecordsOfTopic = {
      type: MessageFromClientType.UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC,
      topic,
    };

    this.send(message);
  }

  public subscribeToOffsetsOfConsumerGroup(groupId: string) {
    const message: SubscribeToOffsetsOfConsumerGroup = {
      type: MessageFromClientType.SUBSCRIBE_TO_OFFSETS_OF_CONSUMER_GROUP,
      groupId,
    };

    this.send(message);
  }

  public unsubscribeFromOffsetsOfConsumerGroup(topic: string) {
    const message: UnsubscribeFromOffsetsOfConsumerGroup = {
      type: MessageFromClientType.UNSUBSCRIBE_FROM_OFFSETS_OF_CONSUMER_GROUP,
      groupId: topic,
    };

    this.send(message);
  }

  public subscribeToOffsetsOfTopic(topic: string) {
    const message: SubscribeToOffsetsOfTopic = {
      type: MessageFromClientType.SUBSCRIBE_TO_OFFSETS_OF_TOPIC,
      topic,
    };

    this.send(message);
  }

  public unsubscribeFromOffsetsOfTopic(topic: string) {
    const message: UnsubscribeFromOffsetsOfTopic = {
      type: MessageFromClientType.UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC,
      topic,
    };

    this.send(message);
  }
}
