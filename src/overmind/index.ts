import { IConfig, OnInitialize } from "overmind";
import {
  createActionsHook,
  createEffectsHook,
  createHook,
  createReactionHook,
  createStateHook,
} from "overmind-react";
import * as effects from "./effects";
import { merge, namespaced } from "overmind/config";
import * as environments from "./environments";
import * as routing from "./routing";
import * as connection from "./connection";

const onInitialize: OnInitialize = ({ actions, effects }, instance) => {
  effects.kafka.init({
    onBackendStarting: actions.connection.onBackendStarting,
    onReadyToConnect: actions.connection.onReadyToConnect,
    onConnectingToEnvironment: actions.connection.onConnectingToEnvironment,
    onConnectedToEnvironment: actions.connection.onConnectedToEnvironment,
    onFailedToConnect: actions.connection.onFailedToConnect,
    onUnexpectedError: actions.connection.onUnexpectedError,
    onRefreshTopics: actions.connection.onRefreshTopics,
    onRefreshConsumerGroups: actions.connection.onRefreshConsumerGroups,
    onRefreshTopicOffsets: actions.connection.onRefreshTopicOffsets,
    onSubscribedToRecordsOfTopic:
      actions.connection.onSubscribedToRecordsOfTopic,
    onUnsubscribedFromRecordsOfTopic:
      actions.connection.onUnsubscribedFromRecordsOfTopic,
    onRecordsReceived: actions.connection.onRecordsReceived,
    onBackendProcessLog: actions.connection.onBackendProcessLog,
  });

  effects.store.loadConfig().then((config) => {
    actions.environments.setEnvironments(config.environments);
  });

  instance.reaction(
    (state) => state.environments.environmentList,
    (environments) =>
      effects.store.saveConfig({
        environments,
      })
  );
};

export const config = merge(
  {
    onInitialize,
    effects,
  },
  namespaced({ environments, routing, connection })
);

declare module "overmind" {
  interface Config extends IConfig<typeof config> {}
}

export const useOvermind = createHook<typeof config>();
export const useOvermindState = createStateHook<typeof config>();
export const useActions = createActionsHook<typeof config>();
export const useEffects = createEffectsHook<typeof config>();
export const useReaction = createReactionHook<typeof config>();
