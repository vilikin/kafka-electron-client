import { Action, AsyncAction } from "overmind";
import { BackendStatus, ConnectionStatus, KafkaTopicState } from "./state";
import * as _ from "lodash";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopic,
  PartitionOffsets,
} from "../../kafka/message-from-server";
import { BackendProcessLogEntry } from "../../kafka/kafka-backend-client";

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

export const onConnected: Action<string> = (
  { state, effects, actions },
  environmentId
) => {
  actions.routing.showMainPage();

  state.connection.state = {
    status: ConnectionStatus.CONNECTED,
    environmentId,
    topics: {},
    consumerGroups: {},
  };
};

export const onConnecting: Action<string> = ({ state }, environmentId) => {
  state.connection.state = {
    status: ConnectionStatus.CONNECTING,
    environmentId,
  };
};

export const onError: Action<Error> = ({ state }, error) => {
  state.connection.state = {
    status: ConnectionStatus.DISCONNECTED,
    error: error.message,
  };
};

export const onRefreshTopics: Action<KafkaTopic[]> = (
  { state: rootState },
  topics
) => {
  const {
    connection: { state },
  } = rootState;

  const newTopicsObj: { [key: string]: KafkaTopicState } = {};

  topics.forEach((topic) => {
    if (state.status === ConnectionStatus.CONNECTED) {
      newTopicsObj[topic.id] = state.topics[topic.id] ?? {
        id: topic.id,
        isInternal: topic.isInternal,
        partitions: topic.partitions,
        records: [],
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

export const onRefreshConsumerGroups: Action<KafkaConsumerGroup[]> = (
  { state: rootState },
  consumerGroups
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    rootState.connection.state = {
      ...state,
      consumerGroups: _.keyBy(consumerGroups, "id"),
    };
  }
};

export const onRefreshTopicOffsets: Action<PartitionOffsets[]> = (
  { state: rootState },
  offsets
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    const topics = _.cloneDeep(state.topics);
    offsets.forEach((partitionOffsets) => {
      topics[partitionOffsets.topic].partitions = topics[
        partitionOffsets.topic
      ].partitions.map((partition) => {
        return {
          ...partition,
          earliestOffset: partitionOffsets.earliest,
          latestOffset: partitionOffsets.latest,
        };
      });
    });

    state.topics = topics;
  }
};

export const onRecordsReceived: Action<KafkaRecord[]> = (
  { state: rootState },
  records
) => {
  const {
    connection: { state },
  } = rootState;

  if (state.status === ConnectionStatus.CONNECTED) {
    records.forEach((record) => {
      state.topics[record.topic].records = _.takeRight(
        [...state.topics[record.topic].records, record],
        100
      );
    });
  }
};

export const onSubscribedToRecordsOfTopic: Action<string> = (
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

export const onUnsubscribedFromRecordsOfTopic: Action<string> = (
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

export const onBackendProcessStarting: Action = ({ state }) => {
  state.connection.backendState = {
    status: BackendStatus.STARTING,
    log: state.connection.backendState.log,
  };
};

export const onBackendProcessReady: Action = ({ state }) => {
  state.connection.backendState = {
    status: BackendStatus.READY,
    log: state.connection.backendState.log,
  };
};

export const onBackendProcessExit: Action<string> = ({ state }, reason) => {
  state.connection.backendState = {
    status: BackendStatus.EXITED,
    log: state.connection.backendState.log,
    reason,
  };
};

export const onBackendProcessLog: Action<BackendProcessLogEntry> = (
  { state },
  logEntry
) => {
  state.connection.backendState = {
    ...state.connection.backendState,
    log: [...state.connection.backendState.log, logEntry],
  };
};
