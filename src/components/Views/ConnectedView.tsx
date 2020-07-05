import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { PageId } from "../../overmind/routing/state";
import { ConnectionStatus } from "../../overmind/connection/state";
import { Topic } from "../Topic/Topic";
import { ConsumerGroup } from "../ConsumerGroup/ConsumerGroup";

export const ConnectedView: FunctionComponent = () => {
  const { environments, routing, connection } = useOvermindState();
  if (connection.state.status !== ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    throw new Error("Not connected");
  }

  if (routing.currentPageId === PageId.HOME) {
    return (
      <div className="flex-1 flex h-full flex-col justify-center items-center">
        <p className="mt-8 text-lg text-gray-800">
          Connected to {environments.selectedEnvironment?.name}
        </p>
      </div>
    );
  }

  if (routing.currentPageId === PageId.TOPIC) {
    return <Topic topicName={routing.topicId} />;
  }

  if (routing.currentPageId === PageId.CONSUMER_GROUP) {
    return <ConsumerGroup groupId={routing.groupId} />;
  }

  return <>No route matched</>;
};
