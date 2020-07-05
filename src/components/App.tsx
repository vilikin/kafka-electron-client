import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar/Sidebar";
import { EnvironmentsModal } from "./Environments/EnvironmentsModal";
import { EnvironmentSelector } from "./Environments/EnvironmentSelector";
import { ConnectionStatus } from "../overmind/connection/state";
import { ConnectedView } from "./Views/ConnectedView";
import { MainView } from "./Views/MainView";
import { UnexpectedErrorView } from "./Views/UnexpectedErrorView";

const View: FunctionComponent = () => {
  const connectionState = useOvermindState().connection.state;
  const {
    selectedEnvironment,
    environmentsObject,
  } = useOvermindState().environments;

  if (connectionState.status === ConnectionStatus.BACKEND_STARTING) {
    return <MainView loading="Starting backend process..." />;
  }

  if (connectionState.status === ConnectionStatus.READY_TO_CONNECT) {
    return <MainView />;
  }

  if (connectionState.status === ConnectionStatus.CONNECTING_TO_ENVIRONMENT) {
    return <MainView loading={`Connecting to ${selectedEnvironment?.name}`} />;
  }

  if (connectionState.status === ConnectionStatus.FAILED_TO_CONNECT) {
    return (
      <MainView
        error={`Failed to connect to ${
          environmentsObject[connectionState.environmentId].name
        }`}
      />
    );
  }

  if (connectionState.status === ConnectionStatus.CONNECTED_TO_ENVIRONMENT) {
    return (
      <>
        <Sidebar />
        <ConnectedView />
      </>
    );
  }

  if (connectionState.status === ConnectionStatus.UNEXPECTED_ERROR) {
    return <UnexpectedErrorView error={connectionState.error} />;
  }

  throw new Error("Unhandled connection state");
};

export const App: FunctionComponent = () => {
  const connectionState = useOvermindState().connection.state;

  return (
    <div className="flex flex-col h-screen w-screen overflow-x-hidden overflow-y-visible">
      {connectionState.status !== ConnectionStatus.UNEXPECTED_ERROR && (
        <EnvironmentSelector />
      )}
      <div className="flex-1 flex items-stretch overflow-y-hidden">
        <View />
      </div>
      <EnvironmentsModal />
    </div>
  );
};
