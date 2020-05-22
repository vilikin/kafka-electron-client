import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { useActions, useOvermindState } from "../overmind";
import { ModalContentType } from "../overmind/state";
import { EnvironmentConfigurationView } from "./EnvironmentConfigurationView/EnvironmentConfigurationView";

export const Modal: FunctionComponent = () => {
  const { visible, contentType } = useOvermindState().modal;
  const { closeModal } = useActions();

  return (
    <div
      className={classNames(
        "fixed w-full h-full top-0 left-0 flex items-center justify-center transition-opacity duration-200 ease-in-out",
        { "pointer-events-none opacity-0": !visible }
      )}
    >
      <div
        className="absolute w-full h-full bg-gray-900 opacity-50"
        onClick={closeModal}
      />

      <div className="bg-white mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div className="py-4 text-left px-6">
          <div className="flex justify-between items-center pb-3">
            <h2 className="text-2xl font-bold mb-3">
              {contentType === ModalContentType.EDIT_ENVIRONMENTS &&
                "Environments"}
            </h2>
            <button className="cursor-pointer z-50" onClick={closeModal}>
              <svg
                className="fill-current text-black"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </button>
          </div>

          {contentType === ModalContentType.EDIT_ENVIRONMENTS && (
            <EnvironmentConfigurationView />
          )}
        </div>
      </div>
    </div>
  );
};
