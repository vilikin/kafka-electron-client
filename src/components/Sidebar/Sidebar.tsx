import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../../overmind";
import {
  ConnectionStatus,
  KafkaTopicState,
} from "../../overmind/connection/state";
import classNames from "classnames";
import { PageId } from "../../overmind/routing/state";
import { replaceEnvColor } from "../../util/tailwind-utils";
import { CollapsableList } from "./CollapsableList";

export const Sidebar: FunctionComponent = () => {
  const { state, topicList, consumerGroupList } = useOvermindState().connection;
  const { routing } = useOvermindState();
  const { showTopicPage, showConsumerGroupPage } = useActions().routing;

  if (state.status !== ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  const topicsBeingConsumed = topicList.filter((topic) => topic.consuming);
  const topicsNotBeingConsumed = topicList.filter((topic) => !topic.consuming);

  return (
    <div className="sidebar bg-gray-900 py-3 overflow-y-scroll">
      <CollapsableList
        header="Consumer groups"
        items={consumerGroupList.map((consumerGroup) => ({
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

interface TopicListProps {
  topics: KafkaTopicState[];
}

export const TopicList: FunctionComponent<TopicListProps> = ({ topics }) => {
  const { showTopicPage } = useActions().routing;
  const { routing, environments } = useOvermindState();

  return (
    <ul className="overflow-hidden mb-3 pt-1">
      {topics.map((topic) => (
        <li key={topic.id}>
          <button
            onClick={() => showTopicPage(topic.id)}
            className={replaceEnvColor(
              classNames(
                "w-full py-2 px-6 text-left text-sm truncate break-all cursor-pointer focus:outline-none",
                {
                  "bg-envcolor-700 text-white":
                    routing.currentPageId === PageId.TOPIC &&
                    routing.topicId === topic.id,
                },
                {
                  "text-gray-500 hover:bg-black focus:bg-black":
                    routing.currentPageId !== PageId.TOPIC ||
                    routing.topicId !== topic.id,
                }
              ),
              environments.selectedEnvironment
            )}
          >
            {topic.id}
          </button>
        </li>
      ))}
    </ul>
  );
};
