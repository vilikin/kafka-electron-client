import { Action } from "overmind";
import * as _ from "lodash";
import { v4 as uuid } from "uuid";
import {
  Environment,
  EnvironmentColor,
  EnvironmentDraft,
  KafkaAuthenticationMethod,
} from "../../models/environments";

export const openEnvironmentsModal: Action = ({ state, actions }) => {
  state.environments.environmentsModalOpen = true;
  actions.environments.copyEnvironmentsToDraftEnvironments();
};

export const discardChangesAndCloseEnvironmentsModal: Action = ({ state }) => {
  if (
    !state.environments.draftEnvironmentsHaveUnsavedChanges ||
    window.confirm(
      "You have unsaved changes. Are you sure you want to discard them?"
    )
  ) {
    state.environments.environmentsModalOpen = false;
  }
};

export const saveChangesAndCloseEnvironmentsModal: Action = ({
  state,
  actions,
}) => {
  actions.environments.saveDraftEnvironments();
  state.environments.environmentsModalOpen = false;
};

export const removeDraftEnvironment: Action<string> = (
  { state, actions },
  environmentId
) => {
  const envToBeRemoved =
    state.environments.draftEnvironmentsObject[environmentId];
  const indexOfEnvToBeRemoved = state.environments.draftEnvironmentList.findIndex(
    (env) => env.id === envToBeRemoved.id
  );

  delete state.environments.draftEnvironmentsObject[environmentId];

  // We need to find the next env to be selected for editing
  if (
    envToBeRemoved.editing &&
    state.environments.draftEnvironmentList.length !== 0
  ) {
    const nextIndex =
      state.environments.draftEnvironmentList.length <= indexOfEnvToBeRemoved
        ? indexOfEnvToBeRemoved - 1
        : indexOfEnvToBeRemoved;
    const envInNextIndex = state.environments.draftEnvironmentList[nextIndex];
    actions.environments.selectDraftEnvironment(envInNextIndex.id);
  }
};

export const copyEnvironmentsToDraftEnvironments: Action = ({ state }) => {
  state.environments.draftEnvironmentsObject = _.mapValues(
    state.environments.environmentsObject,
    (env) => ({
      ..._.chain(env).cloneDeep().omit("selected").value(),
      editing: state.environments.selectedEnvironment
        ? env.selected
        : state.environments.environmentList[0].id === env.id,
    })
  );
};

export const createNewDraftEnvironment: Action = ({ state }) => {
  const id = uuid();
  state.environments.draftEnvironmentsObject = {
    ..._.mapValues(state.environments.draftEnvironmentsObject, (env) => ({
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
  state.environments.draftEnvironmentsObject = {
    ...state.environments.draftEnvironmentsObject,
    [environment.id]: environment,
  };
};

export const selectDraftEnvironment: Action<string> = (
  { state },
  environmentId
) => {
  state.environments.draftEnvironmentsObject = _.mapValues(
    state.environments.draftEnvironmentsObject,
    (env) => ({
      ...env,
      editing: env.id === environmentId,
    })
  );
};

export const saveDraftEnvironments: Action = ({ state }) => {
  state.environments.environmentsObject = _.chain(
    state.environments.draftEnvironmentsObject
  )
    .mapValues((env) => ({
      ..._.chain(env).cloneDeep().omit("editing").value(),
      selected: state.environments.selectedEnvironment?.id === env.id,
    }))
    .value();
};

export const discardDraftEnvironments: Action = ({ actions }) => {
  actions.environments.copyEnvironmentsToDraftEnvironments();
};

export const selectEnvironment: Action<string> = ({ state }, environmentId) => {
  state.environments.environmentList.forEach((environment) => {
    state.environments.environmentsObject[environment.id] = {
      ...state.environments.environmentsObject[environment.id],
      selected: environment.id === environmentId,
    };
  });
};

export const setEnvironments: Action<Environment[]> = (
  { state },
  environments
) => {
  state.environments.environmentsObject = environments.reduce(
    (acc, current) => {
      return {
        ...acc,
        [current.id]: current,
      };
    },
    {}
  );
};
