import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { ConnectionStatus } from "../../overmind/connection/state";

export interface ConsumerGroupProps {
  groupId: string;
}

export const ConsumerGroup: FunctionComponent<ConsumerGroupProps> = ({
  groupId,
}) => {
  const { connection } = useOvermindState();

  if (connection.state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Not connected");
  }

  const consumerGroup = connection.state.consumerGroups[groupId];

  return (
    <div className="flex-1 flex h-full flex-col p-2 px-4">
      <h1 className="text-lg text-gray-700 pb-1 font-semibold truncate break-all">
        {consumerGroup.id}
      </h1>
      <div className="text-gray-600 mb-3">Stats: 1 | Other stat: 2</div>
    </div>
  );
};
