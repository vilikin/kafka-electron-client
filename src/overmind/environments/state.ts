import {
  draftEnvironmentContainsErrors,
  Environment,
  EnvironmentDraft,
} from "../../models/environments";
import { derived } from "overmind";
import * as _ from "lodash";
import { ConnectionStatus } from "../connection/state";

export type EnvironmentsState = {
  environmentsObject: EnvironmentsObject;
  draftEnvironmentsObject: DraftEnvironmentsObject;
  environmentsModalOpen: boolean;
  environmentList: Environment[];
  selectedEnvironment: Environment | null;
  draftEnvironmentList: EnvironmentDraft[];
  draftEnvironmentBeingEdited: EnvironmentDraft | null;
  draftEnvironmentIdsWithErrors: string[];
  draftEnvironmentsHaveUnsavedChanges: boolean;
};

export interface EnvironmentsObject {
  [key: string]: Environment;
}

export interface DraftEnvironmentsObject {
  [key: string]: EnvironmentDraft;
}

export const state: EnvironmentsState = {
  environmentsObject: {},
  draftEnvironmentsObject: {},
  environmentsModalOpen: false,
  environmentList: derived<EnvironmentsState, Environment[]>((state) =>
    Object.values(state.environmentsObject)
  ),
  selectedEnvironment: derived<EnvironmentsState, Environment | null>(
    (state, rootState) => {
      if (
        rootState.connection.state.status ===
          ConnectionStatus.CONNECTING_TO_ENVIRONMENT ||
        rootState.connection.state.status ===
          ConnectionStatus.CONNECTED_TO_ENVIRONMENT
      ) {
        const { environmentId } = rootState.connection.state;
        return state.environmentsObject[environmentId];
      }

      return null;
    }
  ),
  draftEnvironmentList: derived<EnvironmentsState, EnvironmentDraft[]>(
    (state) => Object.values(state.draftEnvironmentsObject)
  ),
  draftEnvironmentBeingEdited: derived<
    EnvironmentsState,
    EnvironmentDraft | null
  >(
    (state) =>
      state.draftEnvironmentList.find((environment) => environment.editing) ??
      null
  ),
  draftEnvironmentIdsWithErrors: derived<EnvironmentsState, string[]>((state) =>
    Object.values(state.draftEnvironmentsObject)
      .filter(draftEnvironmentContainsErrors)
      .map((env) => env.id)
  ),
  draftEnvironmentsHaveUnsavedChanges: derived<EnvironmentsState, boolean>(
    (state) => {
      const normalizedDraftEnvironments: Environment[] = state.draftEnvironmentList.map(
        (env) => _.omit(env, "editing")
      );

      return !_.isEqual(state.environmentList, normalizedDraftEnvironments);
    }
  ),
};
