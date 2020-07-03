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
    onConnected: actions.connection.onConnected,
    onConnecting: actions.connection.onConnecting,
    onDisconnected: actions.connection.onDisconnected,
    onRefreshTopics: actions.connection.onRefreshTopics,
    onRefreshConsumerGroups: actions.connection.onRefreshConsumerGroups,
    onRefreshTopicOffsets: actions.connection.onRefreshTopicOffsets,
    onSubscribedToRecordsOfTopic:
      actions.connection.onSubscribedToRecordsOfTopic,
    onUnsubscribedFromRecordsOfTopic:
      actions.connection.onUnsubscribedFromRecordsOfTopic,
    onRecordsReceived: actions.connection.onRecordsReceived,
    onError: actions.connection.onError,
    onBackendProcessStarting: actions.connection.onBackendProcessStarting,
    onBackendProcessExit: actions.connection.onBackendProcessExit,
    onBackendProcessReady: actions.connection.onBackendProcessReady,
    onBackendProcessLog: actions.connection.onBackendProcessLog,
  });

  effects.store.loadConfig().then((config) => {
    actions.environments.setEnvironments(config.environments);
  });

  instance.reaction(
    (state) => state.environments.environmentList,
    (environments) =>
      effects.store.saveConfig({
        environments: environments.map((environment) => ({
          ...environment,
          selected: false, // we should not select any environment automatically on startup
        })),
      })
  );

  instance.reaction(
    (state) => state.environments.selectedEnvironment,
    (selectedEnvironment) => {
      if (selectedEnvironment) {
        actions.connection.connectToSelectedEnvironment();
      } else {
        actions.connection.disconnect();
      }
    }
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
