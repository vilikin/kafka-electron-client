import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { Environment, getTailwindColor } from "../../models/environments";
import { FaCircle } from "react-icons/fa";

export interface EnvironmentListItemProps {
  onClick: () => void;
  environment: Environment;
  selected: boolean;
}

export const EnvironmentListItem: FunctionComponent<EnvironmentListItemProps> = ({
  onClick,
  environment,
  selected,
}) => {
  return (
    <li className="py-1">
      <button
        className={classNames(
          "flex w-full items-center text-gray-500 hover:text-gray-900 focus:outline-none focus:shadow-outline",
          {
            "text-gray-900": selected,
          }
        )}
        onClick={onClick}
      >
        <FaCircle
          className={`w-3 h-3 flex-auto flex-shrink-0 flex-grow-0 text-${getTailwindColor(
            environment.color
          )}-500`}
        />
        <span className="ml-2 tracking-wide text-sm font-bold">
          {environment.name}
        </span>
      </button>
    </li>
  );
};
