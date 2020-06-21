import { Action } from "overmind";
import { PageId } from "./state";

export const showMainPage: Action = ({ state }) => {
  state.routing = { currentPageId: PageId.HOME };
};

export const showTopicPage: Action<string> = ({ state, effects }, topicId) => {
  if (state.routing.currentPageId === PageId.TOPIC) {
    effects.kafka.unsubscribeFromOffsetsOfTopic(state.routing.topicId);
  }

  effects.kafka.subscribeToOffsetsOfTopic(topicId);

  state.routing = {
    currentPageId: PageId.TOPIC,
    topicId: topicId,
  };
};
