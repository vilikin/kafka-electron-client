import { Environment, getTailwindColor } from "../models/environments";

export function replaceEnvColor(
  classString: string,
  environment: Environment | null
): string {
  return classString.replace(
    /envcolor/g,
    environment ? getTailwindColor(environment.color) : "indigo"
  );
}
