import { Environment, KafkaAuthenticationMethod } from "../models/environments";
import { Admin, Consumer, Kafka as KafkaType, KafkaConfig } from "kafkajs";
const { Kafka } = window.require("kafkajs");

export interface MessagePayload {
  topic: string;
  key: string;
  value: string;
  offset: string;
}

export interface KafkaClientCallbacks {
  onConnected: (environment: Environment) => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
  onConnecting: (environment: Environment) => void;
  onTopicsReceived: (topics: string[]) => void;
  onMessageReceived: (message: MessagePayload) => void;
  onConsumingStarted: (topic: string) => void;
  onConsumingStopped: (topic: string) => void;
  onConsumerRebalancingStateChange: (isRebalancing: boolean) => void;
}

export enum KafkaClientStatus {
  UNINITIALISED,
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export interface KafkaClientStateUninitialised {
  status: KafkaClientStatus.UNINITIALISED;
}

export interface KafkaClientStateDisconnected {
  status: KafkaClientStatus.DISCONNECTED;
  callbacks: KafkaClientCallbacks;
}

export interface KafkaClientStateConnecting {
  status: KafkaClientStatus.CONNECTING;
  callbacks: KafkaClientCallbacks;
  environment: Environment;
}

export interface KafkaClientStateConnected {
  status: KafkaClientStatus.CONNECTED;
  callbacks: KafkaClientCallbacks;
  environment: Environment;

  kafka: KafkaType;
  kafkaAdmin: Admin;
  kafkaConsumer?: Consumer;

  consumingTopics: string[];

  topicRefreshInterval: NodeJS.Timeout;
}

export interface KafkaClientStateError {
  status: KafkaClientStatus.ERROR;
  callbacks: KafkaClientCallbacks;
  environment: Environment;
  error: Error;
}

export type KafkaClientState =
  | KafkaClientStateUninitialised
  | KafkaClientStateDisconnected
  | KafkaClientStateConnecting
  | KafkaClientStateConnected
  | KafkaClientStateError;

export class KafkaClient {
  private state: KafkaClientState = {
    status: KafkaClientStatus.UNINITIALISED,
  };

  public init(callbacks: KafkaClientCallbacks) {
    this.state = {
      status: KafkaClientStatus.DISCONNECTED,
      callbacks,
    };
  }

  public async connect(environment: Environment) {
    if (this.state.status === KafkaClientStatus.UNINITIALISED) {
      throw new Error("Can't connect with uninitialised KafkaClient");
    }

    this.state = {
      status: KafkaClientStatus.CONNECTING,
      callbacks: this.state.callbacks,
      environment,
    };

    this.state.callbacks.onConnecting(environment);

    try {
      const kafkaConfig = createKafkaJSConfigForEnvironment(environment);
      const kafka = new Kafka(kafkaConfig);

      const kafkaAdmin = kafka.admin();
      await kafkaAdmin.connect();

      const topicRefreshInterval = setInterval(() => {
        this.updateTopics(kafkaAdmin);
      }, 10_000);

      this.state = {
        status: KafkaClientStatus.CONNECTED,
        callbacks: this.state.callbacks,
        environment,
        kafka,
        kafkaAdmin,
        consumingTopics: [],
        topicRefreshInterval,
      };

      this.state.callbacks.onConnected(environment);
      await this.updateTopics(kafkaAdmin);
    } catch (e) {
      const error = new Error(
        `Failed to connect to ${environment.name} with KafkaClient. Cause: ${e.message}`
      );

      this.state = {
        status: KafkaClientStatus.ERROR,
        callbacks: this.state.callbacks,
        environment,
        error: error,
      };

      this.state.callbacks.onError(error);
    }
  }

  public async disconnect() {
    if (this.state.status !== KafkaClientStatus.CONNECTED) {
      throw new Error(
        "Can't disconnect while not connected to any environment"
      );
    }

    clearInterval(this.state.topicRefreshInterval);
    await this.state.kafkaAdmin.disconnect();

    this.state.consumingTopics = [];

    if (this.state.kafkaConsumer) {
      await this.state.kafkaConsumer.disconnect();
    }

    this.state = {
      status: KafkaClientStatus.DISCONNECTED,
      callbacks: this.state.callbacks,
    };
  }

  public async updateTopics(kafkaAdmin: Admin) {
    if (this.state.status === KafkaClientStatus.UNINITIALISED) {
      throw new Error("Can't fetch topics with uninitialised KafkaClient");
    }
    const topics = await kafkaAdmin.fetchTopicMetadata(
      (undefined as unknown) as { topics: string[] }
    );

    const topicNames = topics.topics.map((topic) => topic.name);

    this.state.callbacks.onTopicsReceived(topicNames);
  }

  public async startConsumingTopic(topic: string): Promise<void> {
    if (
      this.state.status === KafkaClientStatus.CONNECTED &&
      !this.state.consumingTopics.includes(topic)
    ) {
      this.state.consumingTopics.push(topic);
      await this.restartConsumer();
      this.state.callbacks.onConsumingStarted(topic);
    }
  }

  public async stopConsumingTopic(topic: string): Promise<void> {
    if (
      this.state.status === KafkaClientStatus.CONNECTED &&
      this.state.consumingTopics.includes(topic)
    ) {
      this.state.consumingTopics = this.state.consumingTopics.filter(
        (consumedTopic) => consumedTopic !== topic
      );

      await this.restartConsumer();
      this.state.callbacks.onConsumingStopped(topic);
    }
  }

  public async restartConsumer(): Promise<void> {
    if (this.state.status === KafkaClientStatus.CONNECTED) {
      this.state.callbacks.onConsumerRebalancingStateChange(true);

      if (this.state.kafkaConsumer) {
        await this.state.kafkaConsumer.disconnect();
      }

      if (this.state.consumingTopics.length === 0) {
        return;
      }

      this.state.kafkaConsumer = this.state.kafka.consumer({
        groupId: `kafka-ui-client-consumer-group-${this.state.environment.id}`,
      });

      await this.state.kafkaConsumer.connect();

      await Promise.all(
        this.state.consumingTopics.map(async (consumingTopic) => {
          if (this.state.status === KafkaClientStatus.CONNECTED) {
            await this.state.kafkaConsumer!.subscribe({
              topic: consumingTopic,
            });
          }
        })
      );

      await this.state.kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (this.state.status === KafkaClientStatus.CONNECTED) {
            this.state.callbacks.onMessageReceived({
              topic,
              key: message.key.toString(),
              value: message.value.toString(),
              offset: message.offset,
            });
          }
        },
      });

      this.state.callbacks.onConsumerRebalancingStateChange(false);
    }
  }
}

function createKafkaJSConfigForEnvironment(
  environment: Environment
): KafkaConfig {
  const baseConfig: KafkaConfig = {
    brokers: environment.brokers.split(","),
    clientId: `kafka-ui-client-${environment.id}`,
  };

  if (environment.authentication.method === KafkaAuthenticationMethod.NONE) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    ssl: true,
    sasl: {
      mechanism: "plain",
      username: environment.authentication.username,
      password: environment.authentication.password,
    },
  };
}
