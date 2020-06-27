import React, { FunctionComponent, useCallback } from "react";
import { EnvironmentList } from "./EnvironmentList";
import { useActions, useOvermindState } from "../../overmind";
import { EnvironmentEditor } from "./EnvironmentEditor";
import { FaGlobeEurope } from "react-icons/fa";
import { EnvironmentDraft } from "../../models/environments";

export const EnvironmentConfigurationView: FunctionComponent = () => {
  const {
    draftEnvironmentBeingEdited,
    draftEnvironmentIdsWithErrors,
  } = useOvermindState().environments;
  const {
    selectDraftEnvironment,
    createNewDraftEnvironment,
    discardChangesAndCloseEnvironmentsModal,
    saveChangesAndCloseEnvironmentsModal,
  } = useActions().environments;

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

  return (
    <div className="flex items-stretch" style={{ minWidth: "800px" }}>
      <div className="mr-4 border-r border-gray-300">
        <EnvironmentList
          onCreateNewEnvironment={createEnvironment}
          onEnvironmentClicked={openEnvironmentEditorFor}
        />
      </div>

      <div className="flex-1">
        {draftEnvironmentBeingEdited ? (
          <EnvironmentEditor />
        ) : (
          <div
            className="flex-1 flex flex-col justify-center items-center"
            style={{ minHeight: "400px" }}
          >
            <FaGlobeEurope className="mb-5 text-large-icon text-gray-400" />
            <p className="text-lg text-gray-600 mx-6">
              It looks like you haven't set up any environments yet.
            </p>
            <p className="text-lg text-gray-600 mx-6">
              You can create new environments from the menu on the left.
            </p>
          </div>
        )}
        <div className="flex flex-wrap justify-end border-t border-gray-300 pt-4">
          <button className="btn btn-secondary" onClick={cancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary ml-2"
            onClick={done}
            disabled={draftEnvironmentIdsWithErrors.length > 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
