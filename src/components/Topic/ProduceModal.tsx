import React, { FunctionComponent, useCallback, useState } from "react";
import classNames from "classnames";
import { useActions, useEffects, useOvermindState } from "../../overmind";
import { EnvironmentAwareButton } from "../Common/EnvironmentAwareButton";
import { PageId } from "../../overmind/routing/state";

export const ProduceModal: FunctionComponent = () => {
  const { toggleProduceModal } = useActions().produceModal;
  const { modalOpen } = useOvermindState().produceModal;
  const { routing } = useOvermindState();
  const { kafka } = useEffects();

  const [key, setKey] = useState("");
  const onKeyChange = useCallback(
    (event) => {
      setKey(event.target.value);
    },
    [setKey]
  );

  const [value, setValue] = useState("");
  const onValueChange = useCallback(
    (event) => {
      setValue(event.target.value);
    },
    [setValue]
  );

  const produce = useCallback(() => {
    if (routing.currentPageId === PageId.TOPIC) {
      kafka.produceRecord(routing.topicId, key, value);
      setKey("");
      setValue("");
      toggleProduceModal(false);
    }
  }, [routing, key, setKey, value, setValue, kafka, toggleProduceModal]);

  const closeProduceModal = useCallback(() => {
    toggleProduceModal(false);
  }, [toggleProduceModal]);

  return (
    <div
      className={classNames(
        "fixed w-full h-full top-0 left-0 flex items-center justify-center",
        {
          "pointer-events-none hidden": !modalOpen,
        }
      )}
    >
      <div
        className="absolute w-full h-full bg-gray-900 opacity-50"
        onClick={closeProduceModal}
      />

      <div className="bg-white mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div className="py-4 text-left px-6">
          <div className="flex justify-between items-center pb-3">
            <h2 className="text-2xl font-bold mb-3">Produce</h2>
            <button className="cursor-pointer z-50" onClick={closeProduceModal}>
              <svg
                className="fill-current text-black"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </button>
          </div>
          <div style={{ minWidth: "800px" }}>
            <div>
              <span className="text-gray-800 text-md">Key</span>
              <textarea
                value={key}
                onChange={onKeyChange}
                style={{ height: "100px" }}
                className="w-full p-2 my-2 border rounded border-gray-400 focus:border-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-gray-800 text-md">Value</span>
              <textarea
                value={value}
                onChange={onValueChange}
                style={{ height: "250px" }}
                className="w-full p-2 my-2 border rounded border-gray-400 focus:border-gray-500 focus:outline-none"
              />
            </div>
            <div className="w-full flex flex-row-reverse">
              <EnvironmentAwareButton text="Produce" onClick={produce} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
