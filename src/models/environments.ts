export enum EnvironmentColor {
  RED = "RED",
  ORANGE = "ORANGE",
  YELLOW = "YELLOW",
  GREEN = "GREEN",
  TEAL = "TEAL",
  BLUE = "BLUE",
  INDIGO = "INDIGO",
  PURPLE = "PURPLE",
  PINK = "PINK",
}

const colorEnumMap = {
  [EnvironmentColor.RED]: {
    tailwindColor: "red",
    humanReadableString: "Red",
  },
  [EnvironmentColor.ORANGE]: {
    tailwindColor: "orange",
    humanReadableString: "Orange",
  },
  [EnvironmentColor.YELLOW]: {
    tailwindColor: "yellow",
    humanReadableString: "Yellow",
  },
  [EnvironmentColor.GREEN]: {
    tailwindColor: "green",
    humanReadableString: "Green",
  },
  [EnvironmentColor.TEAL]: {
    tailwindColor: "teal",
    humanReadableString: "Teal",
  },
  [EnvironmentColor.BLUE]: {
    tailwindColor: "blue",
    humanReadableString: "Blue",
  },
  [EnvironmentColor.INDIGO]: {
    tailwindColor: "indigo",
    humanReadableString: "Indigo",
  },
  [EnvironmentColor.PURPLE]: {
    tailwindColor: "purple",
    humanReadableString: "Purple",
  },
  [EnvironmentColor.PINK]: {
    tailwindColor: "pink",
    humanReadableString: "Pink",
  },
};

export enum KafkaAuthenticationMethod {
  SASL_PLAIN = "SASL_PLAIN",
  NONE = "NONE",
}

const authenticationMethodToLabel = {
  [KafkaAuthenticationMethod.NONE]: "No authentication",
  [KafkaAuthenticationMethod.SASL_PLAIN]: "SASL PLAIN",
};

export interface KafkaAuthenticationSasl {
  method: KafkaAuthenticationMethod.SASL_PLAIN;
  username: string;
  password: string;
}

export interface KafkaAuthenticationNone {
  method: KafkaAuthenticationMethod.NONE;
}

export type KafkaAuthentication =
  | KafkaAuthenticationSasl
  | KafkaAuthenticationNone;

export interface Environment {
  id: string;
  name: string;
  color: EnvironmentColor;
  brokers: string;
  authentication: KafkaAuthentication;
}

export interface EnvironmentDraft extends Environment {
  editing: boolean;
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

export function draftEnvironmentContainsErrors(env: EnvironmentDraft): boolean {
  return (
    env.name.length === 0 ||
    env.brokers.length === 0 ||
    (env.authentication.method === KafkaAuthenticationMethod.SASL_PLAIN &&
      (env.authentication.username.length === 0 ||
        env.authentication.password.length === 0))
  );
}
