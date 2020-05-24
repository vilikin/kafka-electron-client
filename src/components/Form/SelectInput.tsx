import React, { FunctionComponent, useCallback } from "react";

export interface SelectInputProps {
  onChange: (value: string) => void;
  value: string;
  options: SelectInputOption[];
  id: string;
  label: string;
}

export interface SelectInputOption {
  value: string;
  label: string;
}

export const SelectInput: FunctionComponent<SelectInputProps> = ({
  onChange,
  value,
  id,
  label,
  options,
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
      <div className="relative">
        <select
          className="block appearance-none w-full border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline bg-white border-gray-500"
          id={id}
          value={value}
          onChange={onChangeCallback}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </>
  );
};
