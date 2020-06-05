export enum ConnectionStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export interface KafkaTopic {
  id: string;
  consuming: boolean;
}

export interface ConnectionStateConnected {
  status: ConnectionStatus.CONNECTED;
  environmentId: string;
  topics: KafkaTopic[];
}

export interface ConnectionStateConnecting {
  status: ConnectionStatus.CONNECTING;
  environmentId: string;
}

export interface ConnectionStateDisconnected {
  status: ConnectionStatus.DISCONNECTED;
  error: string | null;
}

export type ConnectionState =
  | ConnectionStateConnecting
  | ConnectionStateConnected
  | ConnectionStateDisconnected;

export const state: ConnectionState = {
  status: ConnectionStatus.DISCONNECTED,
  error: null,
};
