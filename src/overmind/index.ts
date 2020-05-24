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

const onInitialize: OnInitialize = ({ actions, effects }, instance) => {
  effects.router.route("/", actions.routing.showMainPage);
  effects.router.start();

  effects.store.loadConfig().then((config) => {
    actions.environments.setEnvironments(config.environments);
  });

  instance.reaction(
    (state) => state.environments.environmentsObject,
    (environmentsObject) =>
      effects.store.saveConfig({
        environments: Object.values(environmentsObject),
      }),
    {
      nested: true,
    }
  );
};

export const config = merge(
  {
    onInitialize,
    effects,
  },
  namespaced({ environments, routing })
);

declare module "overmind" {
  interface Config extends IConfig<typeof config> {}
}

export const useOvermind = createHook<typeof config>();
export const useOvermindState = createStateHook<typeof config>();
export const useActions = createActionsHook<typeof config>();
export const useEffects = createEffectsHook<typeof config>();
export const useReaction = createReactionHook<typeof config>();
