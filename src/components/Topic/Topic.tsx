import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
import { Record } from "./Record";

export interface TopicProps {
  topicName: string;
}

export const Topic: FunctionComponent<TopicProps> = ({ topicName }) => {
  const { connection } = useOvermindState();
  const { kafka } = useEffects();
  const recordsDiv = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new records arrive
  const scrollEffectDeps =
    connection.state.status === ConnectionStatus.CONNECTED
      ? [connection.state.topics[topicName].records]
      : [];

  useEffect(() => {
    if (recordsDiv && recordsDiv.current) {
      recordsDiv.current.scrollTop = recordsDiv.current.scrollHeight;
    }
  }, scrollEffectDeps);

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
    <div className="flex-1 flex h-full flex-col p-2 px-4 overflow-hidden">
      <h1 className="text-lg text-gray-700 pb-1 font-semibold truncate break-all">
        {topic.id}
      </h1>
      <div className="text-gray-600 mb-3">
        Partitions: {topic.partitions.length} | Replicas:{" "}
        {topic.partitions[0].replicas.length} | Total records: 10 035 |
        Available records: 456
      </div>
      <div className="flex flex-row mb-3 ">
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
      <div className="h-full overflow-y-scroll" ref={recordsDiv}>
        {topic.records.map((record) => (
          <Record
            key={record.topic + record.partition + record.offset}
            record={record}
          />
        ))}
      </div>
    </div>
  );
};
