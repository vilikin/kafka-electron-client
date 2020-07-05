import { derived } from "overmind";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopicPartition,
} from "../../kafka/message-from-server";
import { BackendProcessLogEntry } from "../../kafka/kafka-backend-client";

export enum ConnectionStatus {
  BACKEND_STARTING = "BACKEND_STARTING",
  READY_TO_CONNECT = "READY_TO_CONNECT",
  CONNECTING_TO_ENVIRONMENT = "CONNECTING_TO_ENVIRONMENT",
  CONNECTED_TO_ENVIRONMENT = "CONNECTED_TO_ENVIRONMENT",
  FAILED_TO_CONNECT = "FAILED_TO_CONNECT",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
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

export type ConnectionStateStartingBackend = {
  status: ConnectionStatus.BACKEND_STARTING;
};

export type ConnectionStateReadyToConnect = {
  status: ConnectionStatus.READY_TO_CONNECT;
};

export type ConnectionStateUnexpectedError = {
  status: ConnectionStatus.UNEXPECTED_ERROR;
  error: string;
};

export type ConnectionStateConnected = {
  status: ConnectionStatus.CONNECTED_TO_ENVIRONMENT;
  environmentId: string;
  topics: { [key: string]: KafkaTopicState };
  consumerGroups: { [key: string]: KafkaConsumerGroup };
};

export type ConnectionStateConnecting = {
  status: ConnectionStatus.CONNECTING_TO_ENVIRONMENT;
  environmentId: string;
};

export type ConnectionStateFailedToConnect = {
  status: ConnectionStatus.FAILED_TO_CONNECT;
  environmentId: string;
};

export type ConnectionState =
  | ConnectionStateStartingBackend
  | ConnectionStateReadyToConnect
  | ConnectionStateUnexpectedError
  | ConnectionStateConnecting
  | ConnectionStateConnected
  | ConnectionStateFailedToConnect;

export type ConnectionRootState = {
  state: ConnectionState;
  backendLog: BackendProcessLogEntry[];
  topicList: KafkaTopicState[];
  consumerGroupList: KafkaConsumerGroup[];
};

export const state: ConnectionRootState = {
  state: {
    status: ConnectionStatus.BACKEND_STARTING,
  },
  backendLog: [],
  topicList: derived<ConnectionRootState, KafkaTopicState[]>((state) => {
    return state.state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT
      ? Object.values(state.state.topics)
      : [];
  }),
  consumerGroupList: derived<ConnectionRootState, KafkaConsumerGroup[]>(
    (state) => {
      return state.state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT
        ? Object.values(state.state.consumerGroups)
        : [];
    }
  ),
};
