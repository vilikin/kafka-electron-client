import { Action } from "overmind";
import { PageId } from "./state";
import { Params } from "../effects";

export const showMainPage: Action = ({ state }) => {
  state.routing = { currentPageId: PageId.HOME };
};

export const showTopicPage: Action<Params> = ({ state }, payload) => {
  state.routing = {
    currentPageId: PageId.TOPIC,
    topicId: payload.topicId,
  };
};
