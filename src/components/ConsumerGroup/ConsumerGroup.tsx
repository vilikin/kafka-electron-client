import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { ConnectionStatus } from "../../overmind/connection/state";
import * as _ from "lodash";

export interface ConsumerGroupProps {
  groupId: string;
}

export const ConsumerGroup: FunctionComponent<ConsumerGroupProps> = ({
  groupId,
}) => {
  const { connection } = useOvermindState();

  if (connection.state.status !== ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    throw new Error("Not connected");
  }

  const consumerGroup = connection.state.consumerGroups[groupId];

  const offsetsGroupedByTopic = _.groupBy(
    consumerGroup.offsets,
    (offsets) => offsets.topic
  );

  return (
    <div className="flex-1 flex h-full flex-col p-2 px-4">
      <h1 className="text-lg text-gray-800 mb-3 font-semibold truncate break-all">
        {consumerGroup.id}
      </h1>
      <table className="w-100 overflow-x-scroll">
        <tr>
          {["Topic", "Partition", "Offset", "Latest", "Earliest", "Lag"].map(
            (header) => (
              <th className="text-left text-gray-800 text-sm tracking-wide uppercase">
                {header}
              </th>
            )
          )}
        </tr>
        {Object.keys(offsetsGroupedByTopic).map((topic) => {
          if (
            connection.state.status ===
            ConnectionStatus.CONNECTED_TO_ENVIRONMENT
          ) {
            const consumerGroupPartitionOffsets = offsetsGroupedByTopic[topic];
            const partitionOffsets = connection.state.topics[topic].partitions;

            return consumerGroupPartitionOffsets.map((groupPartitionOffset) => {
              const partitionOffset = partitionOffsets.find(
                (partition) => partition.id === groupPartitionOffset.partition
              )!;

              return (
                <tr className="text-gray-700">
                  <td>{topic}</td>
                  <td>{groupPartitionOffset.partition}</td>
                  <td>{groupPartitionOffset.offset}</td>
                  <td>{partitionOffset.latestOffset}</td>
                  <td>{partitionOffset.earliestOffset}</td>
                  <td>
                    {partitionOffset.latestOffset! -
                      groupPartitionOffset.offset!}
                  </td>
                </tr>
              );
            });
          }

          return null;
        })}
      </table>
    </div>
  );
};
