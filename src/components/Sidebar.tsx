import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../overmind";
import {
  ConnectionStatus,
  KafkaTopicState,
} from "../overmind/connection/state";
import classNames from "classnames";
import { PageId } from "../overmind/routing/state";

interface TopicListProps {
  topics: KafkaTopicState[];
}

export const TopicList: FunctionComponent<TopicListProps> = ({ topics }) => {
  const { showTopicPage } = useActions().routing;
  const { routing } = useOvermindState();

  return (
    <ul className="overflow-hidden mb-3 pt-1">
      {topics.map((topic) => (
        <li key={topic.id} className="px-1">
          <button
            onClick={() => showTopicPage(topic.id)}
            className={classNames(
              "w-full mb-1 py-2 px-2 text-left text-sm rounded-sm truncate break-all font-bold text-gray-600 cursor-pointer hover:bg-gray-200 focus:outline-none focus:shadow-outline",
              {
                "bg-gray-200 text-gray-700":
                  routing.currentPageId === PageId.TOPIC &&
                  routing.topicId === topic.id,
              }
            )}
          >
            {topic.id}
          </button>
        </li>
      ))}
    </ul>
  );
};

export const Sidebar: FunctionComponent = () => {
  const { state, topicList } = useOvermindState().connection;

  if (state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  const topicsBeingConsumed = topicList.filter((topic) => topic.consuming);
  const topicsNotBeingConsumed = topicList.filter((topic) => !topic.consuming);

  return (
    <div className="sidebar border-gray-200 border-r py-3 px-3 overflow-y-scroll">
      {topicsBeingConsumed.length > 0 && (
        <>
          <h3 className="uppercase text-sm font-bold text-gray-700 px-2 mb-1">
            Consuming
          </h3>
          <TopicList topics={topicsBeingConsumed} />
        </>
      )}
      <h3 className="uppercase text-sm font-bold text-gray-700 px-2 mb-1">
        Topics
      </h3>
      <TopicList topics={topicsNotBeingConsumed} />
    </div>
  );
};
