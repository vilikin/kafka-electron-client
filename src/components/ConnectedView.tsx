import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { PageId } from "../overmind/routing/state";
import { ConnectionStatus } from "../overmind/connection/state";
import { Topic } from "./Topic/Topic";

export const ConnectedView: FunctionComponent = () => {
  const { environments, routing, connection } = useOvermindState();
  if (connection.state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Not connected");
  }

  if (routing.currentPageId === PageId.HOME) {
    return (
      <div className="flex-1 flex h-full flex-col justify-center items-center">
        <p className="mt-8 text-lg text-gray-600 font-semibold">
          Connected to {environments.selectedEnvironment?.name}
        </p>
      </div>
    );
  }

  if (routing.currentPageId === PageId.TOPIC) {
    return <Topic topicName={routing.topicId} />;
  }

  return <>Not at home or at topic</>;
};
