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
  effects.router.route("/", actions.routing.showMainPage);
  effects.router.start();

  effects.kafka.init({
    onTopicsReceived: actions.connection.setTopics,
    onDisconnected: actions.connection.setDisconnected,
    onConnecting: actions.connection.setConnecting,
    onConnected: (environment) => actions.connection.setConnected(environment),
    onError: actions.connection.setError,
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
