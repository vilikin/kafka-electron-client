import { IConfig, OnInitialize } from "overmind";
import {
  createActionsHook,
  createEffectsHook,
  createHook,
  createReactionHook,
  createStateHook,
} from "overmind-react";
import { state } from "./state";
import * as actions from "./actions";
import * as effects from "./effects";

const onInitialize: OnInitialize = ({ actions, effects }, instance) => {
  effects.router.route("/", actions.showMainPage);
  effects.router.start();

  effects.store.loadConfig().then((config) => {
    actions.setEnvironments(config.environments);
  });

  instance.reaction(
    (state) => state.environments,
    (environments) =>
      effects.store.saveConfig({ environments: Object.values(environments) }),
    {
      nested: true,
    }
  );
};

export const config = {
  onInitialize,
  state,
  actions,
  effects,
};

declare module "overmind" {
  interface Config extends IConfig<typeof config> {}
}

export const useOvermind = createHook<typeof config>();
export const useOvermindState = createStateHook<typeof config>();
export const useActions = createActionsHook<typeof config>();
export const useEffects = createEffectsHook<typeof config>();
export const useReaction = createReactionHook<typeof config>();
