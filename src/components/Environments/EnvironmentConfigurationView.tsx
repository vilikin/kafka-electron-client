import React, { FunctionComponent, useCallback } from "react";
import { EnvironmentList } from "./EnvironmentList";
import { useActions, useOvermindState } from "../../overmind";
import { EnvironmentEditor } from "./EnvironmentEditor";
import { Button } from "../Form/Button";
import { FaGlobeEurope, FaTrash } from "react-icons/fa";
import { defaultTailwindColor } from "../../constants";
import { EnvironmentDraft } from "../../models/environments";

export const EnvironmentConfigurationView: FunctionComponent = () => {
  const {
    draftEnvironmentList,
    draftEnvironmentBeingEdited,
    draftEnvironmentIdsWithErrors,
  } = useOvermindState();
  const {
    selectDraftEnvironment,
    createNewDraftEnvironment,
    discardChangesAndCloseEnvironmentsModal,
    saveChangesAndCloseEnvironmentsModal,
    removeDraftEnvironment,
  } = useActions();

  const createEnvironment = useCallback(() => {
    createNewDraftEnvironment();
  }, [createNewDraftEnvironment]);

  const openEnvironmentEditorFor = useCallback(
    (environment: EnvironmentDraft) => {
      selectDraftEnvironment(environment.id);
    },
    [selectDraftEnvironment]
  );

  const cancel = useCallback(() => {
    discardChangesAndCloseEnvironmentsModal();
  }, [discardChangesAndCloseEnvironmentsModal]);

  const done = useCallback(() => {
    saveChangesAndCloseEnvironmentsModal();
  }, [saveChangesAndCloseEnvironmentsModal]);

  const remove = useCallback(() => {
    removeDraftEnvironment(draftEnvironmentBeingEdited!.id);
  }, [removeDraftEnvironment, draftEnvironmentBeingEdited]);

  return (
    <div className="flex items-stretch" style={{ minWidth: "800px" }}>
      {draftEnvironmentList.length !== 0 && (
        <div className="mr-4 border-r border-gray-300">
          <EnvironmentList
            onCreateNewEnvironment={createEnvironment}
            onEnvironmentClicked={openEnvironmentEditorFor}
          />
        </div>
      )}
      {draftEnvironmentBeingEdited !== null && (
        <div className="flex-1">
          <EnvironmentEditor />
          <div className="flex flex-wrap justify-end border-t border-gray-300 pt-4">
            <button
              onClick={remove}
              className="mr-auto bg-gray-100 flex rounded-sm py-2 px-3 items-center text-gray-900 hover:bg-gray-300 focus:outline-none focus:shadow-outline"
            >
              <FaTrash className="flex-auto flex-shrink-0 flex-grow-0 text-gray-700" />
              <span className="ml-3 text-md">Delete environment</span>
            </button>
            <Button text="Cancel" color="gray" onClick={cancel} />
            <Button
              text="Save"
              color={defaultTailwindColor}
              className="ml-2"
              onClick={done}
              disabled={draftEnvironmentIdsWithErrors.length > 0}
            />
          </div>
        </div>
      )}
      {draftEnvironmentList.length === 0 && (
        <div
          className="flex-1 flex flex-col justify-center items-center"
          style={{ minHeight: "400px" }}
        >
          <FaGlobeEurope className="mb-5 text-large-icon text-gray-400" />
          <p className="text-lg text-gray-600">
            It looks like you haven't set up any environments yet. Shall we
            create the first one?
          </p>
          <Button
            text="New environment"
            color="indigo"
            className="mt-5"
            onClick={createNewDraftEnvironment}
          />
        </div>
      )}
    </div>
  );
};
