import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../overmind";
import {
  ConnectionStatus,
  KafkaTopicState,
} from "../overmind/connection/state";
import classNames from "classnames";
import { PageId } from "../overmind/routing/state";
import { replaceEnvColor } from "../util/tailwind-utils";

export const Sidebar: FunctionComponent = () => {
  const { state, topicList } = useOvermindState().connection;

  if (state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  const topicsBeingConsumed = topicList.filter((topic) => topic.consuming);
  const topicsNotBeingConsumed = topicList.filter((topic) => !topic.consuming);

  return (
    <div className="sidebar bg-gray-900 py-3 overflow-y-scroll">
      {topicsBeingConsumed.length > 0 && (
        <>
          <h3 className="text-md text-white px-6 mb-1">Subscribing</h3>
          <TopicList topics={topicsBeingConsumed} />
        </>
      )}
      <h3 className="text-md text-white px-6 mb-1">Topics</h3>
      <TopicList topics={topicsNotBeingConsumed} />
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
