export enum PageId {
  HOME = "HOME",
  TOPIC = "TOPIC",
  CONSUMER_GROUP = "CONSUMER_GROUP",
}

export type RoutingStateHome = {
  currentPageId: PageId.HOME;
};

export type RoutingStateTopic = {
  currentPageId: PageId.TOPIC;
  topicId: string;
};

export type RoutingStateConsumerGroup = {
  currentPageId: PageId.CONSUMER_GROUP;
  groupId: string;
};

export type RoutingState =
  | RoutingStateHome
  | RoutingStateTopic
  | RoutingStateConsumerGroup;

export const state: RoutingState = {
  currentPageId: PageId.HOME,
};
