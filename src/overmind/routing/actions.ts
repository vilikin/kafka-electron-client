import { Action } from "overmind";
import { PageId } from "./state";

export const showMainPage: Action = ({ state }) => {
  state.routing = { currentPageId: PageId.HOME };
};

export const unsubscribeFromCurrentPage: Action = ({ state, effects }) => {
  if (state.routing.currentPageId === PageId.TOPIC) {
    effects.kafka.unsubscribeFromOffsetsOfTopic(state.routing.topicId);
  }

  if (state.routing.currentPageId === PageId.CONSUMER_GROUP) {
    effects.kafka.unsubscribeFromOffsetsOfConsumerGroup(state.routing.groupId);
  }
};

export const showTopicPage: Action<string> = (
  { state, effects, actions },
  topicId
) => {
  actions.routing.unsubscribeFromCurrentPage();

  effects.kafka.subscribeToOffsetsOfTopic(topicId);

  state.routing = {
    currentPageId: PageId.TOPIC,
    topicId,
  };
};

export const showConsumerGroupPage: Action<string> = (
  { state, effects, actions },
  groupId
) => {
  actions.routing.unsubscribeFromCurrentPage();

  effects.kafka.subscribeToOffsetsOfConsumerGroup(groupId);

  state.routing = {
    currentPageId: PageId.CONSUMER_GROUP,
    groupId,
  };
};
