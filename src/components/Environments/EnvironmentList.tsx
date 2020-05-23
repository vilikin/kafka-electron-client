import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { FaCircle, FaPlusCircle } from "react-icons/fa";
import { Environment, getTailwindColor } from "../../models/environments";
import classNames from "classnames";

export interface EnvironmentListProps {
  onEnvironmentClicked: (environment: Environment) => void;
  onCreateNewEnvironment: () => void;
}

export const EnvironmentList: FunctionComponent<EnvironmentListProps> = ({
  onEnvironmentClicked,
  onCreateNewEnvironment,
}) => {
  const { environmentsList, draftEnvironment } = useOvermindState();

  return (
    <div className="pr-4">
      <ul>
        {environmentsList.map((environment) => (
          <li className="mb-1">
            <button
              className={classNames(
                "flex w-full rounded-sm py-2 px-3 items-center text-gray-900 hover:bg-gray-200 focus:outline-none focus:shadow-outline",
                {
                  "bg-gray-200": draftEnvironment?.id === environment.id,
                }
              )}
              onClick={() => onEnvironmentClicked(environment)}
            >
              <FaCircle
                className={`flex-auto flex-shrink-0 flex-grow-0 text-${getTailwindColor(
                  environment.color
                )}-500`}
              />
              <span className="ml-3 text-md">{environment.name}</span>
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
