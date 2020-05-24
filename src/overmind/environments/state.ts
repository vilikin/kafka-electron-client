import {
  draftEnvironmentContainsErrors,
  Environment,
  EnvironmentBase,
  EnvironmentDraft,
} from "../../models/environments";
import { derived } from "overmind";
import * as _ from "lodash";

export type EnvironmentsState = {
  environmentsObject: EnvironmentsObject;
  draftEnvironmentsObject: DraftEnvironmentsObject;
  environmentsModalOpen: boolean;
  environmentList: Environment[];
  draftEnvironmentList: EnvironmentDraft[];
  selectedEnvironment: Environment | null;
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
    (state) =>
      state.environmentList.find((environment) => environment.selected) ?? null
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
      const normalizedEnvironments: EnvironmentBase[] = state.environmentList.map(
        (env) => _.omit(env, "selected")
      );
      const normalizedDraftEnvironments: EnvironmentBase[] = state.draftEnvironmentList.map(
        (env) => _.omit(env, "editing")
      );

      return !_.isEqual(normalizedEnvironments, normalizedDraftEnvironments);
    }
  ),
};
