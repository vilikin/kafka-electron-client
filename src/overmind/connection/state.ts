import { derived } from "overmind";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopic,
} from "../../kafka/message-from-server";

export enum ConnectionStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export interface KafkaTopicState extends KafkaTopic {
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

export type ConnectionRootState = {
  state: ConnectionState;
  topicList: KafkaTopicState[];
  consumerGroupList: KafkaConsumerGroup[];
};

export const state: ConnectionRootState = {
  state: {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
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
