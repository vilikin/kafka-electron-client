import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCaretDown, FaCircle, FaPlus } from "react-icons/fa";
import classNames from "classnames";
import { useActions, useOvermindState } from "../../overmind";
import { ModalContentType } from "../../overmind/state";
import { EnvironmentColor, getTailwindColor } from "../../models/environments";

export const EnvironmentSelector: FunctionComponent = () => {
  const { openModal, selectEnvironment } = useActions();
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

  const handleEnvironmentClick = useCallback(
    (environment) => {
      selectEnvironment(environment.id);
      setDropdownOpen(false);
    },
    [selectEnvironment]
  );

  return (
    <>
      <div
        className={`w-full p-2 bg-${getTailwindColor(
          selectedEnvironment?.color ?? EnvironmentColor.GREEN
        )}-600 shadow-md border-b-2 flex justify-center border-${getTailwindColor(
          selectedEnvironment?.color ?? EnvironmentColor.GREEN
        )}-700`}
      >
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
              "absolute z-40 mt-4 border border-gray-400 shadow-md bg-white rounded-md py-2",
              { hidden: !dropdownOpen }
            )}
            style={{ minWidth: "200px" }}
          >
            {environmentsList.map((environment) => (
              <li>
                <button
                  onClick={() => handleEnvironmentClick(environment)}
                  className="hover:bg-gray-200 py-2 px-3 flex w-full items-center text-gray-800"
                >
                  <FaCircle
                    className={`text-md flex-auto flex-shrink-0 flex-grow-0 text-${getTailwindColor(
                      environment.color
                    )}-500`}
                  />
                  <span className="ml-3 tracking-wide text-md">
                    {environment.name}
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                className="hover:bg-gray-200 py-2 px-3 flex w-full items-center text-gray-800"
                onClick={openEnvironmentConfig}
              >
                <FaPlus
                  className={`text-md flex-auto flex-shrink-0 flex-grow-0 text-gray-500`}
                />
                <span className="ml-3 tracking-wide text-md">
                  Edit environments
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
