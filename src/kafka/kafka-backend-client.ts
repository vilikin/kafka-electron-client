import { Environment, KafkaAuthenticationMethod } from "../models/environments";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopic,
  MessageFromServer,
  MessageFromServerType,
} from "./message-from-server";
import {
  MessageFromClient,
  MessageFromClientType,
  RequestConnect,
  RequestDisconnect,
  SubscribeToOffsetsOfTopic,
  SubscribeToRecordsOfTopic,
  UnsubscribeFromOffsetsOfTopic,
  UnsubscribeFromRecordsOfTopic,
} from "./message-from-client";

export interface KafkaClientCallbacks {
  onConnected: (environmentId: string) => void;
  onDisconnected: (reason: string) => void;
  onConnecting: (environmentId: string) => void;
  onRefreshTopics: (topics: KafkaTopic[]) => void;
  onRefreshConsumerGroups: (consumerGroups: KafkaConsumerGroup[]) => void;
  onRecordsReceived: (records: KafkaRecord[]) => void;
  onSubscribedToRecordsOfTopic: (topic: string) => void;
  onUnsubscribedFromRecordsOfTopic: (topic: string) => void;
  onError: (error: Error) => void;
}

export class KafkaBackendClient {
  private ws: WebSocket | null = null;
  private callbacks: KafkaClientCallbacks | null = null;

  public init(callbacks: KafkaClientCallbacks) {
    this.callbacks = callbacks;

    const ws = new WebSocket("ws://localhost:37452");

    ws.onopen = () => {
      console.log("WebSocket connection with backend established");
      this.ws = ws;
    };

    ws.onclose = () => {
      this.ws = null;
      callbacks.onDisconnected("WebSocket connection with backend closed");
      callbacks.onError(
        new Error("WebSocket connection with backend was closed")
      );
      console.log("WebSocket connection with backend was closed");
    };

    ws.onmessage = (event) => {
      this.receiveMessageFromServer(JSON.parse(event.data));
    };
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
        this.callbacks.onConnected(messageFromServer.environmentId);
        return;
      case MessageFromServerType.STATUS_CONNECTING:
        this.callbacks.onConnecting(messageFromServer.environmentId);
        return;
      case MessageFromServerType.STATUS_DISCONNECTED:
        this.callbacks.onDisconnected(messageFromServer.reason);
        return;
      case MessageFromServerType.REFRESH_TOPICS:
        this.callbacks.onRefreshTopics(messageFromServer.topics);
        return;
      case MessageFromServerType.REFRESH_CONSUMER_GROUPS:
        this.callbacks.onRefreshConsumerGroups(
          messageFromServer.consumerGroups
        );
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
    console.log(environment);
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
