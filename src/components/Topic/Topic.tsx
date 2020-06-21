import React, { FunctionComponent, useCallback } from "react";
import { useEffects, useOvermindState } from "../../overmind";
import { ConnectionStatus } from "../../overmind/connection/state";
import {
  FaPlay,
  FaShareSquare,
  FaTachometerAlt,
  FaAngleDoubleRight,
  FaStop,
} from "react-icons/fa";
import { EnvironmentAwareButton } from "../Common/EnvironmentAwareButton";

export interface TopicProps {
  topicName: string;
}

export const Topic: FunctionComponent<TopicProps> = ({ topicName }) => {
  const { connection } = useOvermindState();
  const { kafka } = useEffects();

  if (connection.state.status !== ConnectionStatus.CONNECTED) {
    throw new Error("Not connected");
  }

  const topic = connection.state.topics[topicName];

  const startConsuming = useCallback(async () => {
    await kafka.subscribeToTopic(topicName);
  }, [kafka, topicName]);

  const stopConsuming = useCallback(async () => {
    await kafka.unsubscribeFromTopic(topicName);
  }, [kafka, topicName]);

  return (
    <div className="flex-1 flex h-full flex-col p-2 px-4">
      <h1 className="text-lg text-gray-700 font-semibold">{topic.id}</h1>
      <div className="text-gray-600 mb-2">
        Partitions: 2 | Replicas: 3 | Total records: 10 035 | Available records:
        456
      </div>
      <div className="flex flex-row pb-3 border-b border-gray-200">
        {topic.consuming ? (
          <EnvironmentAwareButton
            text="Unsubscribe"
            Icon={FaStop}
            onClick={stopConsuming}
          />
        ) : (
          <EnvironmentAwareButton
            text="Subscribe"
            Icon={FaPlay}
            onClick={startConsuming}
          />
        )}
        <EnvironmentAwareButton text="Produce" Icon={FaShareSquare} disabled />
        <EnvironmentAwareButton
          text="Monitor"
          Icon={FaTachometerAlt}
          disabled
        />
        <EnvironmentAwareButton
          text="Seek"
          Icon={FaAngleDoubleRight}
          disabled
        />
      </div>
      <ul>
        {topic.records.map((record) => (
          <li key={record.topic + record.partition + record.offset}>
            <pre>{record.value}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};
