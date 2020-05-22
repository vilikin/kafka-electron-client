export enum EnvironmentColor {
  RED = "RED",
  GREEN = "GREEN",
  ORANGE = "ORANGE",
  YELLOW = "YELLOW",
}

const colorEnumMap = {
  [EnvironmentColor.RED]: {
    tailwindColor: "red",
    humanReadableString: "Red",
  },
  [EnvironmentColor.GREEN]: {
    tailwindColor: "green",
    humanReadableString: "Green",
  },
  [EnvironmentColor.ORANGE]: {
    tailwindColor: "orange",
    humanReadableString: "Orange",
  },
  [EnvironmentColor.YELLOW]: {
    tailwindColor: "yellow",
    humanReadableString: "Yellow",
  },
};

export enum KafkaAuthenticationMethod {
  SASL = "SASL",
  NONE = "NONE",
}

const authenticationMethodToLabel = {
  [KafkaAuthenticationMethod.NONE]: "No authentication",
  [KafkaAuthenticationMethod.SASL]: "SASL PLAIN",
};

export interface KafkaAuthenticationSasl {
  method: KafkaAuthenticationMethod.SASL;
  username: string;
  password: string;
}

export interface KafkaAuthenticationNone {
  method: KafkaAuthenticationMethod.NONE;
}

export type KafkaAuthentication =
  | KafkaAuthenticationSasl
  | KafkaAuthenticationNone;

export interface EnvironmentDraft {
  id: string;
  name: string;
  color: EnvironmentColor;
  brokers: string;
  authentication: KafkaAuthentication;
}

export interface Environment extends EnvironmentDraft {
  selected: boolean;
}

export function getTailwindColor(color: EnvironmentColor) {
  return colorEnumMap[color].tailwindColor;
}

export function getColorLabel(color: EnvironmentColor) {
  return colorEnumMap[color].humanReadableString;
}

export function getKafkaAuthenticationMethodLabel(
  method: KafkaAuthenticationMethod
) {
  return authenticationMethodToLabel[method];
}
