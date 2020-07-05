import React, { FunctionComponent } from "react";
import { FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import { useOvermindState } from "../../overmind";

interface Props {
  loading?: string;
  error?: string;
}

export const MainView: FunctionComponent<Props> = ({ loading, error }) => {
  const { environmentList } = useOvermindState().environments;

  return (
    <div className="flex-1 flex h-full flex-col justify-center items-center text-center">
      <p className="my-3 text-lg text-gray-800 font-semibold">
        Kafka Electron Client
      </p>
      {!loading && !error && (
        <div className="flex items-center my-3">
          <div className="ml-4 text-lg text-gray-800">
            {environmentList.length > 0 ? (
              <>
                <p>
                  Click "Connect" on the top menu to connect to one of your
                  saved environments.
                </p>
                <p>You can also add new environments from the same menu.</p>
              </>
            ) : (
              <>
                <p>You haven't set up any environments yet.</p>
                <p>
                  You can create new environments by clicking "Connect" on the
                  top menu.
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="flex items-center my-3">
          <FaSyncAlt className="text-lg text-gray-800 spinner" />
          <div className="ml-3 text-lg text-gray-800">{loading}</div>
        </div>
      )}
      {error && (
        <div className="flex items-center my-3 ">
          <FaExclamationTriangle className="text-lg text-gray-800 text-red-800" />
          <div className="ml-3 text-lg text-red-800">{error}</div>
        </div>
      )}
    </div>
  );
};
