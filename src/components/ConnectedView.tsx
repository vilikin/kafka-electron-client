import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { PageId } from "../overmind/routing/state";

export const ConnectedView: FunctionComponent = () => {
  const { environments, routing } = useOvermindState();
  return (
    <div className="flex-1 flex h-full flex-col justify-center items-center">
      {routing.currentPageId === PageId.HOME && (
        <p className="mt-8 text-lg text-gray-600 font-semibold">
          Connected to {environments.selectedEnvironment?.name}
        </p>
      )}
      {routing.currentPageId === PageId.TOPIC && (
        <p className="mt-8 text-lg text-gray-600 font-semibold">
          Topic: {routing.topicId}
        </p>
      )}
    </div>
  );
};
