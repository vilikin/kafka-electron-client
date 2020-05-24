import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { FaCircle, FaPlusCircle, FaExclamationTriangle } from "react-icons/fa";
import { EnvironmentDraft, getTailwindColor } from "../../models/environments";
import classNames from "classnames";

export interface EnvironmentListProps {
  onEnvironmentClicked: (environment: EnvironmentDraft) => void;
  onCreateNewEnvironment: () => void;
}

export const EnvironmentList: FunctionComponent<EnvironmentListProps> = ({
  onEnvironmentClicked,
  onCreateNewEnvironment,
}) => {
  const {
    draftEnvironmentList,
    draftEnvironmentBeingEdited,
    draftEnvironmentIdsWithErrors,
  } = useOvermindState().environments;

  return (
    <div className="pr-4">
      <ul>
        {draftEnvironmentList.map((environment) => (
          <li key={environment.id} className="mb-1">
            <button
              className={classNames(
                "flex w-full rounded-sm py-2 px-3 items-center text-gray-900 hover:bg-gray-200 focus:outline-none focus:shadow-outline",
                {
                  "bg-gray-200":
                    draftEnvironmentBeingEdited?.id === environment.id,
                }
              )}
              onClick={() => onEnvironmentClicked(environment)}
            >
              <FaCircle
                className={`flex-auto flex-shrink-0 flex-grow-0 text-${getTailwindColor(
                  environment.color
                )}-500`}
              />
              <span className="mx-3 text-md">{environment.name}</span>
              {draftEnvironmentIdsWithErrors.includes(environment.id) && (
                <FaExclamationTriangle
                  title="There are errors in the configuration of this environment"
                  className={`ml-auto flex-auto flex-shrink-0 flex-grow-0 text-red-500`}
                />
              )}
            </button>
          </li>
        ))}
      </ul>
      <hr className="my-3" />
      <ul>
        <li className="">
          <button
            className="flex w-full rounded-sm py-2 px-3 items-center text-gray-900 hover:bg-gray-200 focus:outline-none focus:shadow-outline"
            onClick={onCreateNewEnvironment}
          >
            <FaPlusCircle
              className={`flex-auto flex-shrink-0 flex-grow-0 text-gray-700`}
            />
            <span className="ml-3 text-md">New environment</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
