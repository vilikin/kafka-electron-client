import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCaretDown, FaCircle, FaCog } from "react-icons/fa";
import classNames from "classnames";
import { useActions, useOvermindState } from "../../overmind";
import { replaceEnvColor } from "../../util/tailwind-utils";

export const EnvironmentSelector: FunctionComponent = () => {
  const {
    openEnvironmentsModal,
    selectEnvironment,
  } = useActions().environments;
  const {
    selectedEnvironment,
    environmentList,
  } = useOvermindState().environments;
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
    openEnvironmentsModal();
    setDropdownOpen(false);
  }, [openEnvironmentsModal]);

  const handleEnvironmentClick = useCallback(
    (environment) => {
      selectEnvironment(environment.id);
      setDropdownOpen(false);
    },
    [selectEnvironment]
  );

  return (
    <div className="flex-auto flex-grow-0 flex-shrink-0">
      <div
        className={replaceEnvColor(
          `w-full p-1 bg-envcolor-600 shadow-md flex justify-center border-b border-t border-envcolor-500 transition-color duration-500`,
          selectedEnvironment
        )}
      >
        <div className="relative" ref={envSelectorAndDropdownRef}>
          <button
            className={replaceEnvColor(
              `inline-flex items-center cursor-pointer text-white rounded-md py-1 px-3 focus:outline-none focus:bg-envcolor-500 hover:bg-envcolor-500`,
              selectedEnvironment
            )}
            onClick={handleEnvironmentSelectorClick}
          >
            <span className="mr-1">
              {selectedEnvironment !== null
                ? selectedEnvironment.name
                : "No environment"}
            </span>
            <FaCaretDown />
          </button>
          <div
            className={classNames(
              "absolute z-40 mt-4 border border-gray-400 shadow-md bg-white rounded-md py-2",
              { hidden: !dropdownOpen }
            )}
          >
            {environmentList.length !== 0 && (
              <>
                <ul>
                  {environmentList.map((environment) => (
                    <li key={environment.id}>
                      <button
                        onClick={() => handleEnvironmentClick(environment)}
                        className="hover:bg-gray-200 py-2 px-3 flex w-full items-center text-gray-900"
                      >
                        <FaCircle
                          className={replaceEnvColor(
                            `text-sm flex-auto flex-shrink-0 flex-grow-0 text-envcolor-500`,
                            environment
                          )}
                        />
                        <span className="ml-3 text-md">{environment.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <hr className="my-2" />
              </>
            )}
            <ul>
              <li>
                <button
                  className="hover:bg-gray-200 py-2 px-3 flex w-full items-center text-gray-900"
                  onClick={openEnvironmentConfig}
                >
                  <FaCog
                    className={`text-md flex-auto flex-shrink-0 flex-grow-0 text-gray-700`}
                  />
                  <span className="ml-3 tracking-wide text-md">
                    Edit&nbsp;environments
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
