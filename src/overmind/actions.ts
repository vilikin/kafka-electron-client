import { Action } from "overmind";
import { PageIds } from "./state";
import { v4 as uuid } from "uuid";
import {
  Environment,
  EnvironmentColor,
  EnvironmentDraft,
  KafkaAuthenticationMethod,
} from "../models/environments";
import * as _ from "lodash";

export const showMainPage: Action = ({ state }) => {
  state.routing.currentPageId = PageIds.HOME;
};

export const openEnvironmentsModal: Action = ({ state, actions }) => {
  state.environmentsModalOpen = true;
  actions.copyEnvironmentsToDraftEnvironments();
};

export const discardChangesAndCloseEnvironmentsModal: Action = ({ state }) => {
  if (
    !state.draftEnvironmentsHaveUnsavedChanges ||
    window.confirm(
      "You have unsaved changes. Are you sure you want to discard them?"
    )
  ) {
    state.environmentsModalOpen = false;
  }
};

export const saveChangesAndCloseEnvironmentsModal: Action = ({
  state,
  actions,
}) => {
  actions.saveDraftEnvironments();
  state.environmentsModalOpen = false;
};

export const removeDraftEnvironment: Action<string> = (
  { state, actions },
  environmentId
) => {
  const envToBeRemoved = state.draftEnvironments[environmentId];
  const indexOfEnvToBeRemoved = state.draftEnvironmentList.findIndex(
    (env) => env.id === envToBeRemoved.id
  );

  delete state.draftEnvironments[environmentId];

  // We need to find the next env to be selected for editing
  if (envToBeRemoved.editing && state.draftEnvironmentList.length !== 0) {
    const nextIndex =
      state.draftEnvironmentList.length <= indexOfEnvToBeRemoved
        ? indexOfEnvToBeRemoved - 1
        : indexOfEnvToBeRemoved;
    const envInNextIndex = state.draftEnvironmentList[nextIndex];
    actions.selectDraftEnvironment(envInNextIndex.id);
  }
};

export const copyEnvironmentsToDraftEnvironments: Action = ({ state }) => {
  state.draftEnvironments = _.mapValues(state.environments, (env) => ({
    ..._.chain(env).cloneDeep().omit("selected").value(),
    editing: state.selectedEnvironment
      ? env.selected
      : state.environmentList[0].id === env.id,
  }));
};

export const createNewDraftEnvironment: Action = ({ state }) => {
  const id = uuid();
  state.draftEnvironments = {
    ..._.mapValues(state.draftEnvironments, (env) => ({
      ...env,
      editing: false,
    })),
    [id]: {
      id,
      name: "New environment",
      color: EnvironmentColor.RED,
      brokers: "",
      authentication: {
        method: KafkaAuthenticationMethod.NONE,
      },
      editing: true,
    },
  };
};

export const updateDraftEnvironment: Action<EnvironmentDraft> = (
  { state },
  environment
) => {
  state.draftEnvironments = {
    ...state.draftEnvironments,
    [environment.id]: environment,
  };
};

export const selectDraftEnvironment: Action<string> = (
  { state },
  environmentId
) => {
  state.draftEnvironments = _.mapValues(state.draftEnvironments, (env) => ({
    ...env,
    editing: env.id === environmentId,
  }));
};

export const saveDraftEnvironments: Action = ({ state }) => {
  state.environments = _.chain(state.draftEnvironments)
    .mapValues((env) => ({
      ..._.chain(env).cloneDeep().omit("editing").value(),
      selected: state.selectedEnvironment?.id === env.id,
    }))
    .value();
};

export const discardDraftEnvironments: Action = ({ actions }) => {
  actions.copyEnvironmentsToDraftEnvironments();
};

export const selectEnvironment: Action<string> = ({ state }, environmentId) => {
  state.environmentList.forEach((environment) => {
    state.environments[environment.id] = {
      ...state.environments[environment.id],
      selected: environment.id === environmentId,
    };
  });
};

export const setEnvironments: Action<Environment[]> = (
  { state },
  environments
) => {
  state.environments = environments.reduce((acc, current) => {
    return {
      ...acc,
      [current.id]: current,
    };
  }, {});
};
