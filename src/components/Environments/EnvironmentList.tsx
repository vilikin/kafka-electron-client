import React, { FunctionComponent } from "react";
import { useOvermindState } from "../../overmind";
import { FaPlus } from "react-icons/fa";
import { Environment } from "../../models/environments";
import { EnvironmentListItem } from "./EnvironmentListItem";

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
          <EnvironmentListItem
            onClick={() => onEnvironmentClicked(environment)}
            environment={environment}
            selected={draftEnvironment?.id === environment.id}
          />
        ))}
      </ul>
      <hr className="my-2" />
      <ul>
        <li className="py-2">
          <button
            className="flex w-full items-center text-gray-500 hover:text-gray-900 focus:outline-none focus:shadow-outline"
            onClick={onCreateNewEnvironment}
          >
            <FaPlus className={`w-3 h-3 flex-auto flex-shrink-0 flex-grow-0`} />
            <span className="ml-2 tracking-wide text-sm font-bold">
              New environment
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
};
