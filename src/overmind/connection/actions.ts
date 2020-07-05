import { Action, AsyncAction } from "overmind";
import { ConnectionStatus, KafkaTopicState } from "./state";
import * as _ from "lodash";
import {
  KafkaConsumerGroup,
  KafkaRecord,
  KafkaTopic,
  PartitionOffsets,
} from "../../kafka/message-from-server";
import { BackendProcessLogEntry } from "../../kafka/kafka-backend-client";

export const connect: AsyncAction<string> = async (
  { state, actions, effects },
  environmentId
) => {
  const { connection, environments } = state;
  const environment = environments.environmentsObject[environmentId];

  if (
    connection.state.status === ConnectionStatus.READY_TO_CONNECT ||
    connection.state.status === ConnectionStatus.FAILED_TO_CONNECT
  ) {
    await effects.kafka.connect(environment);
  }

  if (connection.state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    await effects.kafka.disconnect();
    await effects.kafka.connect(environment);
  }
};

export const disconnect: AsyncAction = async ({ effects, state }) => {
  if (
    state.connection.state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT
  ) {
    await effects.kafka.disconnect();
  }
};

export const onBackendStarting: Action = ({ state }) => {
  state.connection.state = {
    status: ConnectionStatus.BACKEND_STARTING,
  };
};

export const onReadyToConnect: Action = ({ state }) => {
  state.connection.state = {
    status: ConnectionStatus.READY_TO_CONNECT,
  };
};

export const onConnectingToEnvironment: Action<string> = (
  { state },
  environmentId
) => {
  state.connection.state = {
    status: ConnectionStatus.CONNECTING_TO_ENVIRONMENT,
    environmentId,
  };
};

export const onConnectedToEnvironment: Action<string> = (
  { state, effects, actions },
  environmentId
) => {
  actions.routing.showMainPage();

  state.connection.state = {
    status: ConnectionStatus.CONNECTED_TO_ENVIRONMENT,
    environmentId,
    topics: {},
    consumerGroups: {},
  };
};

export const onFailedToConnect: Action<string> = ({ state }, environmentId) => {
  state.connection.state = {
    status: ConnectionStatus.FAILED_TO_CONNECT,
    environmentId,
  };
};

export const onUnexpectedError: Action<string> = ({ state }, error) => {
  state.connection.state = {
    status: ConnectionStatus.UNEXPECTED_ERROR,
    error,
  };
};

export const onBackendProcessLog: Action<BackendProcessLogEntry[]> = (
  { state },
  logEntries
) => {
  state.connection.backendLog = [...state.connection.backendLog, ...logEntries];
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
    if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
      newTopicsObj[topic.id] = state.topics[topic.id] ?? {
        id: topic.id,
        isInternal: topic.isInternal,
        partitions: topic.partitions,
        records: [],
        consuming: false,
      };
    }
  });

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
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

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
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

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
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

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
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

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
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

  if (state.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    state.topics[topic] = {
      ...state.topics[topic],
      consuming: false,
    };
  }
};
