import React, { FunctionComponent, useCallback } from "react";
import { useEffects, useOvermindState } from "../../overmind";
import { ConnectionStatus } from "../../overmind/connection/state";

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
    await kafka.startConsumingTopic(topicName);
  }, [kafka, topicName]);

  const stopConsuming = useCallback(async () => {
    await kafka.stopConsumingTopic(topicName);
  }, [kafka, topicName]);

  return (
    <div className="flex-1 flex h-full flex-col">
      <p className="mt-8 text-lg text-gray-600 font-semibold">
        Topic: {topic.id}
      </p>
      {!connection.state.isConsumerRebalancing &&
        (!topic.consuming ? (
          <button onClick={startConsuming} className="btn btn-primary">
            Consume
          </button>
        ) : (
          <button onClick={stopConsuming} className="btn btn-primary">
            Stop
          </button>
        ))}
      <ul>
        {topic.messages.map((message) => (
          <li key={message.offset}>
            <pre>{message.value}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};
