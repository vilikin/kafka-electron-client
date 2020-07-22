import { KafkaAuthenticationMethod } from "../models/environments";

export enum MessageFromClientType {
  REQUEST_CONNECT = "REQUEST_CONNECT",
  REQUEST_DISCONNECT = "REQUEST_DISCONNECT",
  SUBSCRIBE_TO_RECORDS_OF_TOPIC = "SUBSCRIBE_TO_RECORDS_OF_TOPIC",
  UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC = "UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC",
  SUBSCRIBE_TO_OFFSETS_OF_CONSUMER_GROUP = "SUBSCRIBE_TO_OFFSETS_OF_CONSUMER_GROUP",
  UNSUBSCRIBE_FROM_OFFSETS_OF_CONSUMER_GROUP = "UNSUBSCRIBE_FROM_OFFSETS_OF_CONSUMER_GROUP",
  SUBSCRIBE_TO_OFFSETS_OF_TOPIC = "SUBSCRIBE_TO_OFFSETS_OF_TOPIC",
  UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC = "UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC",
  PRODUCE_RECORD = "PRODUCE_RECORD",
}

export interface RequestConnect {
  type: MessageFromClientType.REQUEST_CONNECT;
  environmentId: string;
  brokers: string[];
  authenticationStrategy: KafkaAuthenticationMethod;
  username?: string;
  password?: string;
}

export interface RequestDisconnect {
  type: MessageFromClientType.REQUEST_DISCONNECT;
}

export interface SubscribeToRecordsOfTopic {
  type: MessageFromClientType.SUBSCRIBE_TO_RECORDS_OF_TOPIC;
  topic: string;
}

export interface UnsubscribeFromRecordsOfTopic {
  type: MessageFromClientType.UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC;
  topic: string;
}

export interface SubscribeToOffsetsOfConsumerGroup {
  type: MessageFromClientType.SUBSCRIBE_TO_OFFSETS_OF_CONSUMER_GROUP;
  groupId: string;
}

export interface UnsubscribeFromOffsetsOfConsumerGroup {
  type: MessageFromClientType.UNSUBSCRIBE_FROM_OFFSETS_OF_CONSUMER_GROUP;
  groupId: string;
}

export interface SubscribeToOffsetsOfTopic {
  type: MessageFromClientType.SUBSCRIBE_TO_OFFSETS_OF_TOPIC;
  topic: string;
}

export interface UnsubscribeFromOffsetsOfTopic {
  type: MessageFromClientType.UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC;
  topic: string;
}

export interface ProduceRecord {
  type: MessageFromClientType.PRODUCE_RECORD;
  topic: string;
  key: string;
  value: string;
}

export type MessageFromClient =
  | RequestConnect
  | RequestDisconnect
  | SubscribeToRecordsOfTopic
  | UnsubscribeFromRecordsOfTopic
  | SubscribeToOffsetsOfConsumerGroup
  | UnsubscribeFromOffsetsOfConsumerGroup
  | SubscribeToOffsetsOfTopic
  | UnsubscribeFromOffsetsOfTopic
  | ProduceRecord;
