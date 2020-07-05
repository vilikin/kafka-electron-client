import React, { FunctionComponent } from "react";

interface Props {
  error: string;
}

export const UnexpectedErrorView: FunctionComponent<Props> = ({ error }) => {
  return (
    <div className="flex-1 flex h-full flex-col justify-center items-center text-center">
      <p className="my-3 text-lg text-gray-800 font-semibold">Oops</p>
      <p className="my-3 text-lg text-gray-800">
        An unexpected error occurred: {error}
      </p>
      <p className="my-3 text-lg text-gray-800">
        Reloading the app might help.
      </p>
    </div>
  );
};
