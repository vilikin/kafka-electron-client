import React, { FunctionComponent, useCallback, useState } from "react";
import { EnvironmentList } from "./EnvironmentList";
import { useActions, useOvermindState } from "../../overmind";
import { EnvironmentEditor } from "./EnvironmentEditor";
import { Button } from "../Form/Button";

export const EnvironmentConfigurationView: FunctionComponent = () => {
  const {
    environmentsList,
    draftEnvironment,
    draftEnvironmentIsNew,
  } = useOvermindState();
  const { updateDraftEnvironment, createNewDraftEnvironment } = useActions();

  const createEnvironment = useCallback(() => {
    createNewDraftEnvironment();
  }, [updateDraftEnvironment]);

  const openEnvironmentEditorFor = useCallback(
    (environment) => {
      updateDraftEnvironment({ ...environment });
    },
    [updateDraftEnvironment]
  );

  return (
    <div className="flex items-stretch" style={{ minWidth: "800px" }}>
      {environmentsList.length !== 0 && !draftEnvironmentIsNew && (
        <div className="mr-4 border-r border-gray-300">
          <EnvironmentList
            onCreateNewEnvironment={createEnvironment}
            onEnvironmentClicked={openEnvironmentEditorFor}
          />
        </div>
      )}
      {draftEnvironment !== null && (
        <div className="flex-1">
          <EnvironmentEditor />
        </div>
      )}
      {environmentsList.length === 0 && draftEnvironment === null && (
        <div
          className="flex-1 flex flex-col justify-center items-center"
          style={{ minHeight: "400px" }}
        >
          <p className="text-md text-gray-700">
            It looks like you haven't set up any environments yet. Shall we
            create the first one?
          </p>
          <Button
            text="New environment"
            color="blue"
            className="mt-5"
            onClick={createNewDraftEnvironment}
          />
        </div>
      )}
      {environmentsList.length !== 0 && draftEnvironment === null && (
        <div
          className="flex-1 flex flex-col justify-center items-center"
          style={{ minHeight: "400px" }}
        >
          <p className="text-md text-gray-700">
            Edit one of the environments by clicking them on the left side, or
            create a new environment.
          </p>
          <Button
            text="New environment"
            color="blue"
            className="mt-5"
            onClick={createNewDraftEnvironment}
          />
        </div>
      )}
    </div>
  );
};
