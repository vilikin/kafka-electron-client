import { Action } from "overmind";

export const changeEnvironment: Action<string> = (
  { state },
  environment: string
) => {
  state.environment = environment;
};
