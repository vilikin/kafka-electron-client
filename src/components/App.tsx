import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar/Sidebar";
import { EnvironmentsModal } from "./Environments/EnvironmentsModal";
import { EnvironmentSelector } from "./Environments/EnvironmentSelector";
import { ConnectionStatus } from "../overmind/connection/state";
import { ConnectingView } from "./ConnectingView";
import { DisconnectedView } from "./DisconnectedView";
import { ConnectedView } from "./ConnectedView";

export const App: FunctionComponent = () => {
  const { status } = useOvermindState().connection.state;

  return (
    <div className="flex flex-col h-screen w-screen overflow-x-hidden overflow-y-visible">
      <EnvironmentSelector />
      <div className="flex-1 flex items-stretch overflow-y-hidden">
        {status === ConnectionStatus.CONNECTED && (
          <>
            <Sidebar />
            <ConnectedView />
          </>
        )}
        {status === ConnectionStatus.CONNECTING && <ConnectingView />}
        {status === ConnectionStatus.DISCONNECTED && <DisconnectedView />}
      </div>
      <EnvironmentsModal />
    </div>
  );
};
