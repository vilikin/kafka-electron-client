import { derived } from "overmind";

export enum ConnectionStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export interface KafkaTopic {
  id: string;
  consuming: boolean;
}

export type ConnectionStateConnected = {
  status: ConnectionStatus.CONNECTED;
  environmentId: string;
  topics: { [key: string]: KafkaTopic };
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
  topicList: KafkaTopic[];
};

export const state: ConnectionRootState = {
  state: {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
  },
  topicList: derived<ConnectionRootState, KafkaTopic[]>((state) => {
    return state.state.status === ConnectionStatus.CONNECTED
      ? Object.values(state.state.topics)
      : [];
  }),
};
