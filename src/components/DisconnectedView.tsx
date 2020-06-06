import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { ConnectionStatus } from "../overmind/connection/state";

export const DisconnectedView: FunctionComponent = () => {
  const { state } = useOvermindState().connection;

  return (
    <div className="flex-1 flex h-full flex-col justify-center items-center">
      <p className="mt-8 text-lg text-gray-600 font-semibold">
        {(state.status === ConnectionStatus.DISCONNECTED && state.error) ||
          "Disconnected"}
      </p>
    </div>
  );
};
