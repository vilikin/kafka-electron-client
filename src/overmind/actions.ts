import { Action, AsyncAction } from "overmind";
import { ModalContentType, PageIds } from "./state";
import { v4 as uuid } from "uuid";
import {
  Environment,
  EnvironmentColor,
  EnvironmentDraft,
  KafkaAuthenticationMethod,
} from "../models/environments";

export const showMainPage: Action = ({ state }) => {
  state.routing.currentPageId = PageIds.HOME;
};

export const openModal: Action<ModalContentType> = ({ state }, contentType) => {
  state.modal.visible = true;
  state.modal.contentType = contentType;
};

export const closeModal: AsyncAction = async ({ state }) => {
  state.modal.visible = false;

  await new Promise((resolve) => {
    setTimeout(() => {
      state.modal.contentType = null;
      resolve();
    }, 500);
  });
};

export const removeEnvironment: Action<string> = ({ state }, environmentId) => {
  delete state.environments[environmentId];
};

export const createNewDraftEnvironment: Action = ({ state }) => {
  state.draftEnvironment = {
    id: uuid(),
    name: "",
    color: EnvironmentColor.GREEN,
    brokers: "",
    authentication: {
      method: KafkaAuthenticationMethod.NONE,
    },
  };
};

export const updateDraftEnvironment: Action<EnvironmentDraft> = (
  { state },
  environment
) => {
  state.draftEnvironment = environment;
};

export const discardDraftEnvironment: Action = ({ state }) => {
  if (state.environmentsList.length === 0) {
    state.draftEnvironment = null;
    return;
  }

  state.draftEnvironment = { ...state.environmentsList[0] };
};

export const saveDraftEnvironment: Action = ({ state }) => {
  if (!state.draftEnvironment) return;

  if (state.draftEnvironmentIsNew) {
    state.environments[state.draftEnvironment.id] = {
      ...state.draftEnvironment,
      selected: false,
    };
    return;
  }

  state.environments[state.draftEnvironment.id] = {
    ...state.draftEnvironment,
    selected: state.environments[state.draftEnvironment.id].selected,
  };
};
