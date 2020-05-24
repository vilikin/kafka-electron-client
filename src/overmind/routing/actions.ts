import { Action } from "overmind";
import { PageId } from "./state";

export const showMainPage: Action = ({ state }) => {
  state.routing.currentPageId = PageId.HOME;
};
