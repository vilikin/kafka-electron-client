import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { ConnectionStatus } from "../overmind/connection/state";

export const Sidebar: FunctionComponent = () => {
  const { state, topicList } = useOvermindState().connection;
  if (state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Can't render Sidebar while not being connected");
  }

  return (
    <div className="sidebar border-gray-200 border-r py-3 px-2 overflow-y-scroll">
      <h3 className="px-3 uppercase text-sm font-bold text-gray-600 mb-2">
        Topics
      </h3>
      <ul className="overflow-hidden">
        {topicList.map((topic) => (
          <li>
            <a className="flex w-full rounded-sm py-2 px-3 cursor-pointer items-center hover:bg-gray-200 focus:outline-none focus:shadow-outline">
              <span className="text-sm font-bold text-gray-700 truncate break-all">
                {topic.id}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
