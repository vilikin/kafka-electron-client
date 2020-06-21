import { EnvironmentBase, getTailwindColor } from "../models/environments";

export function replaceEnvColor(
  classString: string,
  environment: EnvironmentBase | null
): string {
  return classString.replace(
    /envcolor/g,
    environment ? getTailwindColor(environment.color) : "indigo"
  );
}
