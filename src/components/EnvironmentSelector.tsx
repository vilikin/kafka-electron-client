import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCaretDown } from "react-icons/fa";
import classNames from "classnames";
import { useActions, useOvermindState } from "../overmind";
import { ModalContentType } from "../overmind/state";

export const EnvironmentSelector: FunctionComponent = () => {
  const { openModal } = useActions();
  const { selectedEnvironment, environmentsList } = useOvermindState();
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

  const openEnvironmentConfig = useCallback(() => {
    openModal(ModalContentType.EDIT_ENVIRONMENTS);
    setDropdownOpen(false);
  }, [openModal]);

  return (
    <>
      <div className="w-full p-2 bg-blue-600 shadow-md border-b-2 flex justify-center border-blue-700">
        <div className="relative" ref={envSelectorAndDropdownRef}>
          <button
            className="inline-flex items-center cursor-pointer text-white focus:outline-none"
            onClick={handleEnvironmentSelectorClick}
          >
            <span className="mr-1">
              {selectedEnvironment !== null
                ? selectedEnvironment.name
                : "No environment"}
            </span>
            <FaCaretDown />
          </button>
          <ul
            className={classNames(
              "absolute z-40 mt-4 border border-gray-600 shadow-md bg-white rounded-md py-2",
              { hidden: !dropdownOpen }
            )}
            style={{ width: "260px" }}
          >
            {environmentsList.map((environment) => (
              <li
                key={environment.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white"
              >
                {environment.name}
              </li>
            ))}
            <li className="px-3 py-2 cursor-pointer hover:bg-gray-800 hover:text-white">
              <button onClick={openEnvironmentConfig}>Edit environments</button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
