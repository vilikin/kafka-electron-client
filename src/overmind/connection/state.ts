import { derived } from "overmind";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopicPartition,
} from "../../kafka/message-from-server";
import { BackendProcessLogEntry } from "../../kafka/kafka-backend-client";

export enum BackendStatus {
  STARTING = "STARTING",
  READY = "READY",
  EXITED = "EXITED",
}

export enum ConnectionStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export interface KafkaTopicPartitionState extends KafkaTopicPartition {
  earliestOffset?: number;
  latestOffset?: number;
}

export interface KafkaTopicState {
  id: string;
  isInternal: boolean;
  partitions: KafkaTopicPartitionState[];
  records: KafkaRecord[];
  consuming: boolean;
}

export type ConnectionStateConnected = {
  status: ConnectionStatus.CONNECTED;
  environmentId: string;
  topics: { [key: string]: KafkaTopicState };
  consumerGroups: { [key: string]: KafkaConsumerGroup };
};

export type ConnectionStateConnecting = {
  status: ConnectionStatus.CONNECTING;
  environmentId: string;
};

export type ConnectionStateDisconnected = {
  status: ConnectionStatus.DISCONNECTED;
  error: string | null;
};

export type ConnectionState =
  | ConnectionStateConnecting
  | ConnectionStateConnected
  | ConnectionStateDisconnected;

export type BackendStateStarting = {
  status: BackendStatus.STARTING;
  log: BackendProcessLogEntry[];
};

export type BackendStateReady = {
  status: BackendStatus.READY;
  log: BackendProcessLogEntry[];
};

export type BackendStateExited = {
  status: BackendStatus.EXITED;
  log: BackendProcessLogEntry[];
  reason: string;
};

export type BackendState =
  | BackendStateStarting
  | BackendStateReady
  | BackendStateExited;

export type ConnectionRootState = {
  state: ConnectionState;
  backendState: BackendState;
  topicList: KafkaTopicState[];
  consumerGroupList: KafkaConsumerGroup[];
};

export const state: ConnectionRootState = {
  state: {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
  },
  backendState: {
    status: BackendStatus.EXITED,
    log: [],
    reason: "Initial state",
  },
  topicList: derived<ConnectionRootState, KafkaTopicState[]>((state) => {
    return state.state.status === ConnectionStatus.CONNECTED
      ? Object.values(state.state.topics)
      : [];
  }),
  consumerGroupList: derived<ConnectionRootState, KafkaConsumerGroup[]>(
    (state) => {
      return state.state.status === ConnectionStatus.CONNECTED
        ? Object.values(state.state.consumerGroups)
        : [];
    }
  ),
};
