import React, { FunctionComponent } from "react";
import { EnvironmentSelector } from "./EnvironmentSelector";

export const Sidebar: FunctionComponent = () => {
  return (
    <div
      className="flex-grow-0 flex-shrink-0 bg-gray-900 h-screen shadow-md"
      style={{ width: "250px" }}
    >
      <EnvironmentSelector />
      <a href="#!" className="text-white">
        Home
      </a>
    </div>
  );
};
