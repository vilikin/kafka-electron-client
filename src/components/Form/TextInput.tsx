import React, { FunctionComponent, useCallback } from "react";
import classNames from "classnames";

export interface TextInputProps {
  onChange: (value: string) => void;
  value: string;
  error?: string;
  type?: string;
  id: string;
  placeholder?: string;
  label: string;
  required?: boolean;
}

export const TextInput: FunctionComponent<TextInputProps> = ({
  onChange,
  value,
  error,
  type,
  id,
  placeholder,
  label,
  required,
}) => {
  const onChangeCallback = useCallback(
    (event) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <>
      <label
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className={classNames(
          "appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-white",
          { "border-red-500": error !== undefined },
          { "border-gray-500": error === undefined }
        )}
        placeholder={placeholder}
        value={value}
        type={type ?? "text"}
        id={id}
        onChange={onChangeCallback}
        required={required}
      />
    </>
  );
};
