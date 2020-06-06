export enum PageId {
  HOME = "HOME",
  TOPIC = "TOPIC",
}

export type RoutingStateHome = {
  currentPageId: PageId.HOME;
};

export type RoutingStateTopic = {
  currentPageId: PageId.TOPIC;
  topicId: string;
};

export type RoutingState = RoutingStateHome | RoutingStateTopic;

export const state: RoutingState = {
  currentPageId: PageId.HOME,
};
