import { Action, AsyncAction } from "overmind";
import { ConnectionStatus, KafkaTopic } from "./state";
import { Environment } from "../../models/environments";
import * as _ from "lodash";

export const connectToSelectedEnvironment: AsyncAction = async ({
  state,
  actions,
  effects,
}) => {
  const { connection, environments } = state;
  if (environments.selectedEnvironment) {
    if (connection.state.status === ConnectionStatus.CONNECTED) {
      if (
        connection.state.environmentId === environments.selectedEnvironment.id
      ) {
        return;
      }

      await actions.connection.disconnect();
    }

    await effects.kafka.connect(environments.selectedEnvironment);
  }
};

export const disconnect: AsyncAction = async ({ effects, state }) => {
  if (state.connection.state.status !== ConnectionStatus.DISCONNECTED) {
    await effects.kafka.disconnect();
  }
};

export const setDisconnected: Action = ({ state }) => {
  state.connection.state = {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
  };
};

export const setConnected: Action<Environment> = ({ state }, environment) => {
  state.connection.state = {
    status: ConnectionStatus.CONNECTED,
    environmentId: environment.id,
    topics: {},
  };
};

export const setConnecting: Action<Environment> = ({ state }, environment) => {
  state.connection.state = {
    status: ConnectionStatus.CONNECTING,
    environmentId: environment.id,
  };
};

export const setError: Action<Error> = ({ state }, error) => {
  state.connection.state = {
    status: ConnectionStatus.DISCONNECTED,
    error: error.message,
  };
};

export const setTopics: Action<KafkaTopic[]> = ({ state }, topics) => {
  if (state.connection.state.status === ConnectionStatus.CONNECTED) {
    state.connection.state.topics = _.keyBy(topics, "id");
  }
};
