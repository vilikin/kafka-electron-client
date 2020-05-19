import { Action } from "overmind";
import { PageIds } from "./state";

export const changeEnvironment: Action<string> = (
  { state },
  environment: string
) => {
  state.environment = environment;
};

export const showMainPage: Action = ({ state }) => {
  state.routing.currentPageId = PageIds.HOME;
};

export const showEnvironmentsPage: Action = ({ state }) => {
  state.routing.currentPageId = PageIds.EDIT_ENVIRONMENTS;
};
