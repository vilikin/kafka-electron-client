import { Action, AsyncAction } from "overmind";
import { ConnectionStatus } from "./state";
import { Environment } from "../../models/environments";

export const connectToSelectedEnvironment: AsyncAction = async ({
  state,
  actions,
  effects,
}) => {
  const { connection, environments } = state;
  if (environments.selectedEnvironment) {
    if (connection.status === ConnectionStatus.CONNECTED) {
      if (connection.environmentId === environments.selectedEnvironment.id) {
        return;
      }

      await actions.connection.disconnect();
    }

    await effects.kafka.connect(environments.selectedEnvironment);
  }
};

export const disconnect: AsyncAction = async ({ effects, state }) => {
  if (state.connection.status !== ConnectionStatus.DISCONNECTED) {
    await effects.kafka.disconnect();
  }
};

export const setDisconnected: Action = ({ state }) => {
  state.connection = {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
  };
};

export const setConnected: Action<{
  environment: Environment;
  topics: string[];
}> = ({ state }, payload) => {
  state.connection = {
    status: ConnectionStatus.CONNECTED,
    topics: payload.topics.map((topic) => ({
      id: topic,
      consuming: false,
    })),
    environmentId: payload.environment.id,
  };
};

export const setConnecting: Action<Environment> = ({ state }, environment) => {
  state.connection = {
    status: ConnectionStatus.CONNECTING,
    environmentId: environment.id,
  };
};

export const setError: Action<Error> = ({ state }, error) => {
  state.connection = {
    status: ConnectionStatus.DISCONNECTED,
    error: error.message,
  };
};

export const setTopics: Action<string[]> = ({ state }, topics) => {
  if (state.connection.status === ConnectionStatus.CONNECTED) {
    state.connection.topics = topics.map((topic) => ({
      id: topic,
      consuming: false,
    }));
  }
};
