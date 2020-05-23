import { derived } from "overmind";
import {
  draftEnvironmentContainsErrors,
  Environment,
  EnvironmentBase,
  EnvironmentDraft,
} from "../models/environments";
import * as _ from "lodash";

export type AppState = {
  routing: RoutingState;
  environmentsModalOpen: boolean;
  environments: EnvironmentsState;
  draftEnvironments: DraftEnvironmentsState;
  environmentList: Environment[];
  selectedEnvironment: Environment | null;
  draftEnvironmentList: EnvironmentDraft[];
  draftEnvironmentBeingEdited: EnvironmentDraft | null;
  draftEnvironmentIdsWithErrors: string[];
  draftEnvironmentsHaveUnsavedChanges: boolean;
};

export interface EnvironmentsState {
  [key: string]: Environment;
}

export interface DraftEnvironmentsState {
  [key: string]: EnvironmentDraft;
}

export enum PageIds {
  HOME = "HOME",
}

export interface RoutingState {
  currentPageId: PageIds;
}

export const state: AppState = {
  environments: {},
  draftEnvironments: {},
  routing: {
    currentPageId: PageIds.HOME,
  },
  environmentsModalOpen: false,
  environmentList: derived<AppState, Environment[]>((state) =>
    Object.values(state.environments)
  ),
  selectedEnvironment: derived<AppState, Environment | null>(
    (state) =>
      state.environmentList.find((environment) => environment.selected) ?? null
  ),
  draftEnvironmentList: derived<AppState, EnvironmentDraft[]>((state) =>
    Object.values(state.draftEnvironments)
  ),
  draftEnvironmentBeingEdited: derived<AppState, EnvironmentDraft | null>(
    (state) =>
      state.draftEnvironmentList.find((environment) => environment.editing) ??
      null
  ),
  draftEnvironmentIdsWithErrors: derived<AppState, string[]>((state) =>
    Object.values(state.draftEnvironments)
      .filter(draftEnvironmentContainsErrors)
      .map((env) => env.id)
  ),
  draftEnvironmentsHaveUnsavedChanges: derived<AppState, boolean>((state) => {
    const normalizedEnvironments: EnvironmentBase[] = state.environmentList.map(
      (env) => _.omit(env, "selected")
    );
    const normalizedDraftEnvironments: EnvironmentBase[] = state.draftEnvironmentList.map(
      (env) => _.omit(env, "editing")
    );

    return !_.isEqual(normalizedEnvironments, normalizedDraftEnvironments);
  }),
};
