import { Action, AsyncAction } from "overmind";
import { ConnectionStatus, KafkaTopic } from "./state";
import { Environment } from "../../models/environments";
import { MessagePayload } from "../../kafka/kafka-client";
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

export const onDisconnected: Action = ({ state }) => {
  state.connection.state = {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
  };
};

export const onConnected: Action<Environment> = (
  { state, effects },
  environment
) => {
  effects.router.open("/");

  state.connection.state = {
    status: ConnectionStatus.CONNECTED,
    environmentId: environment.id,
    topics: {},
    isConsumerRebalancing: false,
  };
};

export const onConnecting: Action<Environment> = ({ state }, environment) => {
  state.connection.state = {
    status: ConnectionStatus.CONNECTING,
    environmentId: environment.id,
  };
};

export const onError: Action<Error> = ({ state }, error) => {
  state.connection.state = {
    status: ConnectionStatus.DISCONNECTED,
    error: error.message,
  };
};

export const onTopicsReceived: Action<string[]> = (
  { state: rootState },
  topics
) => {
  const {
    connection: { state },
  } = rootState;
  const newTopicsObj: { [key: string]: KafkaTopic } = {};

  topics.forEach((topic) => {
    if (state.status === ConnectionStatus.CONNECTED) {
      newTopicsObj[topic] = state.topics[topic] ?? {
        id: topic,
        messages: [],
        consuming: false,
      };
    }
  });

  if (state.status === ConnectionStatus.CONNECTED) {
    rootState.connection.state = {
      ...state,
      topics: newTopicsObj,
    };
  }
};

export const onMessageReceived: Action<MessagePayload> = (
  { state: rootState },
  message
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    state.topics[message.topic].messages = _.takeRight(
      [...state.topics[message.topic].messages, message],
      100
    );
  }
};

export const onConsumingStarted: Action<string> = (
  { state: rootState },
  topic
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    state.topics[topic] = {
      ...state.topics[topic],
      consuming: true,
    };
  }
};

export const onConsumingStopped: Action<string> = (
  { state: rootState },
  topic
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    state.topics[topic] = {
      ...state.topics[topic],
      consuming: false,
    };
  }
};

export const onConsumerRebalancingStateChange: Action<boolean> = (
  { state: rootState },
  isRebalancing
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    rootState.connection.state = {
      ...state,
      isConsumerRebalancing: isRebalancing,
    };
  }
};
