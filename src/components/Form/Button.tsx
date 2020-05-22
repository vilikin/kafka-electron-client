import React, { FunctionComponent } from "react";
import classNames from "classnames";

export interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: "button" | "submit";
  color: string;
  className?: string;
  disabled?: boolean;
}

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  text,
  type,
  color,
  className,
  disabled,
}) => {
  return (
    <button
      className={classNames(
        className,
        `disabled:bg-gray-500 disabled:cursor-auto bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`
      )}
      type={type ?? "button"}
      onClick={onClick}
      disabled={!!disabled}
    >
      {text}
    </button>
  );
};
