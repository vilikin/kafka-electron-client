import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../../overmind";
import { ConnectionStatus } from "../../overmind/connection/state";
import { PageId } from "../../overmind/routing/state";
import { CollapsableList } from "./CollapsableList";
import * as _ from "lodash";

export const Sidebar: FunctionComponent = () => {
  const { state, topicList, consumerGroupList } = useOvermindState().connection;
  const { routing } = useOvermindState();
  const { showTopicPage, showConsumerGroupPage } = useActions().routing;

  if (state.status !== ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  const topicsBeingConsumed = _.chain(topicList)
    .filter((topic) => topic.consuming)
    .orderBy((topic) => topic.id)
    .value();

  const topicsNotBeingConsumed = _.chain(topicList)
    .filter((topic) => !topic.consuming)
    .orderBy((topic) => topic.id)
    .value();

  const consumerGroups = _.orderBy(
    consumerGroupList,
    (consumerGroup) => consumerGroup.id
  );

  return (
    <div className="sidebar bg-gray-900 py-3 overflow-y-scroll">
      <CollapsableList
        header="Consumer groups"
        items={consumerGroups.map((consumerGroup) => ({
          id: consumerGroup.id,
          label: consumerGroup.id,
          selected:
            routing.currentPageId === PageId.CONSUMER_GROUP &&
            routing.groupId === consumerGroup.id,
        }))}
        onItemClicked={(id) => showConsumerGroupPage(id)}
      />
      {topicsBeingConsumed.length > 0 && (
        <CollapsableList
          header="Subscribing"
          items={topicsBeingConsumed.map((topic) => ({
            id: topic.id,
            label: topic.id,
            selected:
              routing.currentPageId === PageId.TOPIC &&
              routing.topicId === topic.id,
          }))}
          onItemClicked={(id) => showTopicPage(id)}
        />
      )}
      <CollapsableList
        header="Topics"
        items={topicsNotBeingConsumed.map((topic) => ({
          id: topic.id,
          label: topic.id,
          selected:
            routing.currentPageId === PageId.TOPIC &&
            routing.topicId === topic.id,
        }))}
        onItemClicked={(id) => showTopicPage(id)}
      />
    </div>
  );
};
