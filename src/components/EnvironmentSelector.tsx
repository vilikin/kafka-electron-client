import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import classNames from "classnames";

export const EnvironmentSelector: FunctionComponent = () => {
  const envSelectorAndDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePotentialOutsideClick = useCallback((event) => {
    if (envSelectorAndDropdownRef.current?.contains(event.target)) {
      return;
    }

    setDropdownOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handlePotentialOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handlePotentialOutsideClick);
    };
  }, [handlePotentialOutsideClick]);

  const handleEnvironmentSelectorClick = useCallback(() => {
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={envSelectorAndDropdownRef}>
      <button
        onClick={handleEnvironmentSelectorClick}
        className="w-full p-4 bg-red-600 hover:bg-red-700 text-white text-center cursor-pointer focus:outline-none focus:bg-red-800"
      >
        Production
      </button>
      <ul
        className={classNames(
          "absolute z-40 mt-3 ml-3 border border-gray-600 shadow-md bg-white rounded-md py-2",
          { hidden: !dropdownOpen }
        )}
        style={{ width: "260px" }}
      >
        <li className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white">
          Production
        </li>
        <li className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white">
          UAT
        </li>
        <li className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white">
          Dev
        </li>
        <li className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white">
          Edit environments
        </li>
      </ul>
    </div>
  );
};
