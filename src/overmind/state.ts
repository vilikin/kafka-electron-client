import { derived } from "overmind";
import { Environment, EnvironmentDraft } from "../models/environments";

export type AppState = {
  routing: RoutingState;
  modal: ModalState;
  environments: EnvironmentsState;
  draftEnvironment: EnvironmentDraft | null;
  environmentsList: Environment[];
  selectedEnvironment: Environment | null;
  draftEnvironmentIsNew: boolean;
  draftContainsChanges: boolean;
};

export interface EnvironmentsState {
  [key: string]: Environment;
}

export enum PageIds {
  HOME = "HOME",
}

export interface RoutingState {
  currentPageId: PageIds;
}

export enum ModalContentType {
  EDIT_ENVIRONMENTS = "EDIT_ENVIRONMENTS",
}

export interface ModalState {
  visible: boolean;
  contentType: ModalContentType | null;
}

export const state: AppState = {
  environments: {},
  draftEnvironment: null,
  routing: {
    currentPageId: PageIds.HOME,
  },
  modal: {
    visible: false,
    contentType: null,
  },
  environmentsList: derived<AppState, Environment[]>((state) =>
    Object.values(state.environments)
  ),
  selectedEnvironment: derived<AppState, Environment | null>(
    (state) =>
      state.environmentsList.find((environment) => environment.selected) ?? null
  ),
  draftEnvironmentIsNew: derived<AppState, boolean>(
    (state) =>
      state.draftEnvironment !== null &&
      !state.environmentsList.some(
        (env) => env.id === state.draftEnvironment?.id
      )
  ),
  draftContainsChanges: derived<AppState, boolean>((state) => {
    if (state.draftEnvironment && !state.draftEnvironmentIsNew) {
      const environment = state.environmentsList.find(
        (env) => env.id === state.draftEnvironment!.id
      )!;

      const draftWithSelectedProp = {
        ...state.draftEnvironment,
        selected: environment.selected,
      };

      return (
        JSON.stringify(environment) !== JSON.stringify(draftWithSelectedProp)
      );
    }

    return false;
  }),
};
