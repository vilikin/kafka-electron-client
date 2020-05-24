import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar";
import { PageId } from "../overmind/routing/state";
import { EnvironmentsModal } from "./Environments/EnvironmentsModal";
import { EnvironmentSelector } from "./Environments/EnvironmentSelector";

export const App: FunctionComponent = () => {
  const { currentPageId } = useOvermindState().routing;
  const { selectedEnvironment } = useOvermindState().environments;

  return (
    <div className="h-screen overflow-x-hidden overflow-y-visible">
      <EnvironmentSelector />
      <div className="flex">
        {selectedEnvironment !== null && <Sidebar />}
        <div className="flex-1 bg-grey-lightest text-center">
          {currentPageId === PageId.HOME && <div></div>}
        </div>
        <EnvironmentsModal />
      </div>
    </div>
  );
};
