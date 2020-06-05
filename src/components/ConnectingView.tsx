import React, { FunctionComponent } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { useOvermindState } from "../overmind";

export const ConnectingView: FunctionComponent = () => {
  const { selectedEnvironment } = useOvermindState().environments;
  return (
    <div className="flex-1 flex h-full flex-col justify-center items-center">
      <FaSyncAlt className="text-large-icon text-gray-500 spinner" />
      <p className="mt-8 text-lg text-gray-600 font-semibold">
        Connecting to {selectedEnvironment?.name}
      </p>
    </div>
  );
};
