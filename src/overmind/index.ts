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
  effects.router.initialize({
    "/": actions.routing.showMainPage,
    "/topic/:topicId": actions.routing.showTopicPage,
  });

  effects.kafka.init({
    onTopicsReceived: actions.connection.onTopicsReceived,
    onDisconnected: actions.connection.onDisconnected,
    onConnecting: actions.connection.onConnecting,
    onConnected: (environment) => actions.connection.onConnected(environment),
    onError: actions.connection.onError,
    onMessageReceived: actions.connection.onMessageReceived,
    onConsumingStarted: actions.connection.onConsumingStarted,
    onConsumingStopped: actions.connection.onConsumingStopped,
    onConsumerRebalancingStateChange:
      actions.connection.onConsumerRebalancingStateChange,
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
