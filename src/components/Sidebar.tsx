import React, { FunctionComponent } from "react";
import { EnvironmentSelector } from "./EnvironmentSelector";

export const Sidebar: FunctionComponent = () => {
  return (
    <div
      className="flex-grow-0 flex-shrink-0 h-screen bg-gray-200"
      style={{ flexBasis: "250px" }}
    >
      Sidebar content
    </div>
  );
};
