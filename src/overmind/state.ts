export interface AppState {
  environment: string;
  routing: RoutingState;
}

export enum PageIds {
  HOME = "HOME",
  EDIT_ENVIRONMENTS = "EDIT_ENVIRONMENTS",
}

export interface RoutingState {
  currentPageId: PageIds;
}

export const state: AppState = {
  environment: "Production",
  routing: {
    currentPageId: PageIds.EDIT_ENVIRONMENTS,
  },
};
