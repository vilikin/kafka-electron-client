import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../overmind";
import { ConnectionStatus } from "../overmind/connection/state";

export const Sidebar: FunctionComponent = () => {
  const { state, topicList } = useOvermindState().connection;
  const { showTopicPage } = useActions().routing;

  if (state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  const topicsBeingConsumed = topicList.filter((topic) => topic.consuming);
  const topicsNotBeingConsumed = topicList.filter((topic) => !topic.consuming);

  return (
    <div className="sidebar border-gray-200 border-r py-3 px-2 overflow-y-scroll">
      {topicsBeingConsumed.length > 0 && (
        <>
          <h3 className="px-3 uppercase text-sm font-bold text-gray-600 mb-2">
            Consuming
          </h3>
          <ul className="overflow-hidden mb-3">
            {topicsBeingConsumed.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => showTopicPage(topic.id)}
                  className="flex w-full rounded-sm py-2 px-3 cursor-pointer items-center hover:bg-gray-200 focus:outline-none focus:shadow-outline"
                >
                  <span className="text-sm font-bold text-gray-700 truncate break-all">
                    {topic.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3 className="px-3 uppercase text-sm font-bold text-gray-600 mb-2">
        Topics
      </h3>
      <ul className="overflow-hidden">
        {topicsNotBeingConsumed.map((topic) => (
          <li key={topic.id}>
            <button
              onClick={() => showTopicPage(topic.id)}
              className="flex w-full rounded-sm py-2 px-3 cursor-pointer items-center hover:bg-gray-200 focus:outline-none focus:shadow-outline"
            >
              <span className="text-sm font-bold text-gray-700 truncate break-all">
                {topic.id}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
