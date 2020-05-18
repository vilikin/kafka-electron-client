import React from "react";
import { useActions, useOvermindState } from "./overmind";
const { remote } = window.require("electron");
const fs = window.require("fs");
const path = window.require("path");

function doNodeStuff() {
  const userDataPath = remote.app.getPath("userData");
  const configPath = path.join(userDataPath, "config.json");
  fs.writeFileSync(configPath, "{}");
}

function App() {
  const environment = useOvermindState().environment;
  const { changeEnvironment } = useActions();

  return (
    <div className="max-w-md mx-auto flex p-6 bg-gray-100 mt-10 rounded-lg shadow-xl">
      <div className="ml-6 pt-1">
        <h1 className="text-2xl text-blue-700 leading-tight">
          Tailwind and Create React App
        </h1>
        <p className="text-base text-gray-700 leading-normal">
          Building apps together
        </p>
        <p>{environment}</p>
        <button onClick={() => changeEnvironment("dev")}>Change to dev</button>
        <button onClick={doNodeStuff}>Do node stuff</button>
      </div>
    </div>
  );
}

export default App;
