import React, { FunctionComponent } from "react";
import { useActions, useOvermindState } from "../overmind";
import { Sidebar } from "./Sidebar";
const { remote } = window.require("electron");
const fs = window.require("fs");
const path = window.require("path");

function doNodeStuff() {
  const userDataPath = remote.app.getPath("userData");
  const configPath = path.join(userDataPath, "config.json");
  fs.writeFileSync(configPath, "{}");
}

export const App: FunctionComponent = () => {
  const environment = useOvermindState().environment;
  const { changeEnvironment } = useActions();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-grey-lightest text-center">Main Content</div>
    </div>
  );
};
