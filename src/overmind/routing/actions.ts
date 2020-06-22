import { Action } from "overmind";
import { PageId } from "./state";

export const showMainPage: Action = ({ state }) => {
  state.routing = { currentPageId: PageId.HOME };
};

export const showTopicPage: Action<string> = ({ state }, topicId) => {
  state.routing = {
    currentPageId: PageId.TOPIC,
    topicId: topicId,
  };
};
