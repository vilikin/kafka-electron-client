import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar";
import { PageIds } from "../overmind/state";
const { remote } = window.require("electron");
const fs = window.require("fs");
const path = window.require("path");

function doNodeStuff() {
  const userDataPath = remote.app.getPath("userData");
  const configPath = path.join(userDataPath, "config.json");
  fs.writeFileSync(configPath, "{}");
}

export const App: FunctionComponent = () => {
  const { currentPageId } = useOvermindState().routing;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-grey-lightest text-center">
        {currentPageId === PageIds.EDIT_ENVIRONMENTS && (
          <div>We are configuring environments here</div>
        )}
        {currentPageId === PageIds.HOME && <div>We are home now :)</div>}
      </div>
    </div>
  );
};
