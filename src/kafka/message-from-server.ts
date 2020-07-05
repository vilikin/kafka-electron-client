export enum MessageFromServerType {
  STATUS_CONNECTED = "STATUS_CONNECTED",
  STATUS_CONNECTING = "STATUS_CONNECTING",
  STATUS_FAILED_TO_CONNECT = "STATUS_FAILED_TO_CONNECT",
  STATUS_DISCONNECTED = "STATUS_DISCONNECTED",
  REFRESH_TOPICS = "REFRESH_TOPICS",
  REFRESH_CONSUMER_GROUPS = "REFRESH_CONSUMER_GROUPS",
  REFRESH_TOPIC_OFFSETS = "REFRESH_TOPIC_OFFSETS",
  RECEIVE_RECORDS = "RECEIVE_RECORDS",
  SUBSCRIBED_TO_RECORDS_OF_TOPIC = "SUBSCRIBED_TO_RECORDS_OF_TOPIC",
  UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC = "UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC",
}

export enum DisconnectReason {
  CLIENT_REQUESTED_DISCONNECT = "CLIENT_REQUESTED_DISCONNECT",
  ALL_WEBSOCKET_SESSIONS_CLOSED = "ALL_WEBSOCKET_SESSIONS_CLOSED",
  APPLICATION_EXITING = "APPLICATION_EXITING",
}

export interface KafkaTopicPartition {
  id: number;
  replicas: number[];
  inSyncReplicas: number[];
  leader: number;
}

export interface KafkaTopic {
  id: string;
  isInternal: boolean;
  partitions: KafkaTopicPartition[];
}

export interface PartitionOffsets {
  topic: string;
  partition: number;
  earliest: number;
  latest: number;
}

export interface ConsumerGroupOffsetForPartition {
  topic: string;
  partition: number;
  offset: number;
}

export interface KafkaConsumerGroup {
  id: string;
  offsets: ConsumerGroupOffsetForPartition[];
}

export interface KafkaRecord {
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
  key: string | null;
  value: string;
}

export interface StatusConnected {
  type: MessageFromServerType.STATUS_CONNECTED;
  environmentId: string;
}

export interface StatusConnecting {
  type: MessageFromServerType.STATUS_CONNECTING;
  environmentId: string;
}

export interface StatusFailedToConnect {
  type: MessageFromServerType.STATUS_FAILED_TO_CONNECT;
  environmentId: string;
  error: string;
}

export interface StatusDisconnected {
  type: MessageFromServerType.STATUS_DISCONNECTED;
  environmentId: string;
  reason: DisconnectReason;
}

export interface RefreshTopics {
  type: MessageFromServerType.REFRESH_TOPICS;
  topics: KafkaTopic[];
}

export interface RefreshConsumerGroups {
  type: MessageFromServerType.REFRESH_CONSUMER_GROUPS;
  consumerGroups: KafkaConsumerGroup[];
}

export interface RefreshTopicOffsets {
  type: MessageFromServerType.REFRESH_TOPIC_OFFSETS;
  offsets: PartitionOffsets[];
}

export interface SubscribedToRecordsOfTopic {
  type: MessageFromServerType.SUBSCRIBED_TO_RECORDS_OF_TOPIC;
  topic: string;
}

export interface UnsubscribedFromRecordsOfTopic {
  type: MessageFromServerType.UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC;
  topic: string;
}

export interface ReceiveRecords {
  type: MessageFromServerType.RECEIVE_RECORDS;
  records: KafkaRecord[];
}

export type MessageFromServer =
  | StatusConnected
  | StatusConnecting
  | StatusFailedToConnect
  | StatusDisconnected
  | RefreshTopics
  | RefreshConsumerGroups
  | RefreshTopicOffsets
  | SubscribedToRecordsOfTopic
  | UnsubscribedFromRecordsOfTopic
  | ReceiveRecords;
