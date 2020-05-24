export enum PageId {
  HOME = "HOME",
}

export type RoutingState = {
  currentPageId: PageId;
};

export const state: RoutingState = {
  currentPageId: PageId.HOME,
};
