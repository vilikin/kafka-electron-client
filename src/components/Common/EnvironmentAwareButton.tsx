import React, { FunctionComponent } from "react";
import { IconType } from "react-icons";
import { replaceEnvColor } from "../../util/tailwind-utils";
import { useOvermindState } from "../../overmind";

export interface EnvironmentAwareButtonProps {
  text: string;
  Icon?: IconType;
  [key: string]: any;
}

export const EnvironmentAwareButton: FunctionComponent<EnvironmentAwareButtonProps> = ({
  text,
  Icon,
  ...props
}) => {
  const { selectedEnvironment } = useOvermindState().environments;
  return (
    <button
      className={replaceEnvColor(
        "btn flex items-center mr-2 bg-transparent text-gray-700 border border-gray-500 border-envcolor-700 text-envcolor-700 hover:border-envcolor-500 hover:text-envcolor-500",
        selectedEnvironment
      )}
      {...props}
    >
      {Icon && <Icon className="text-sm flex-auto flex-shrink-0 flex-grow-0" />}
      <span className={`${Icon && "ml-2"} text-md`}>{text}</span>
    </button>
  );
};
