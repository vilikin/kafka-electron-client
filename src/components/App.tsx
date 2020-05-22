import React, { FunctionComponent } from "react";
import { useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar";
import { PageIds } from "../overmind/state";
import { Modal } from "./Modal";
import { EnvironmentSelector } from "./Environments/EnvironmentSelector";

export const App: FunctionComponent = () => {
  const { currentPageId } = useOvermindState().routing;
  const { selectedEnvironment } = useOvermindState();

  return (
    <div className="h-screen overflow-x-hidden overflow-y-visible">
      <EnvironmentSelector />
      <div className="flex">
        {selectedEnvironment !== null && <Sidebar />}
        <div className="flex-1 bg-grey-lightest text-center">
          {currentPageId === PageIds.HOME && <div>We are home now :)</div>}
        </div>
        <Modal />
      </div>
    </div>
  );
};
