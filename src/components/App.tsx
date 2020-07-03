import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar/Sidebar";
import { EnvironmentsModal } from "./Environments/EnvironmentsModal";
import { EnvironmentSelector } from "./Environments/EnvironmentSelector";
import { BackendStatus, ConnectionStatus } from "../overmind/connection/state";
import { ConnectingView } from "./ConnectingView";
import { DisconnectedView } from "./DisconnectedView";
import { ConnectedView } from "./ConnectedView";

export const App: FunctionComponent = () => {
  const connectionState = useOvermindState().connection.state;
  const { backendState } = useOvermindState().connection;

  return (
    <div className="flex flex-col h-screen w-screen overflow-x-hidden overflow-y-visible">
      <EnvironmentSelector />
      <div className="flex-1 flex items-stretch overflow-y-hidden">
        {backendState.status === BackendStatus.READY ? (
          <>
            {connectionState.status === ConnectionStatus.CONNECTED && (
              <>
                <Sidebar />
                <ConnectedView />
              </>
            )}
            {connectionState.status === ConnectionStatus.CONNECTING && (
              <ConnectingView />
            )}
            {connectionState.status === ConnectionStatus.DISCONNECTED && (
              <DisconnectedView />
            )}
          </>
        ) : (
          <>
            {backendState.status === BackendStatus.STARTING && (
              <div>Spawning backend process...</div>
            )}

            {backendState.status === BackendStatus.EXITED && (
              <div>Backend process has exited: {backendState.reason}</div>
            )}

            <hr />
            <pre>
              {backendState.log.map(
                (entry) => entry.type + ": " + entry.message + "\n"
              )}
            </pre>
          </>
        )}
      </div>
      <EnvironmentsModal />
    </div>
  );
};
