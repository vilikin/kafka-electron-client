import React, { FunctionComponent, useCallback } from "react";
import { useActions, useOvermindState } from "../../overmind";
import { TextInput } from "../Form/TextInput";
import { SelectInput } from "../Form/SelectInput";
import {
  EnvironmentColor,
  getColorLabel,
  getKafkaAuthenticationMethodLabel,
  KafkaAuthentication,
  KafkaAuthenticationMethod,
} from "../../models/environments";

export const EnvironmentEditor: FunctionComponent = () => {
  const { draftEnvironmentBeingEdited } = useOvermindState();

  const { updateDraftEnvironment } = useActions();

  const onEnvironmentNameChange = useCallback(
    (value) => {
      updateDraftEnvironment({ ...draftEnvironmentBeingEdited!, name: value });
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  const onEnvironmentColorChange = useCallback(
    (value) => {
      updateDraftEnvironment({ ...draftEnvironmentBeingEdited!, color: value });
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  const onBrokersChange = useCallback(
    (value) => {
      updateDraftEnvironment({
        ...draftEnvironmentBeingEdited!,
        brokers: value,
      });
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  const onAuthenticationMethodChange = useCallback(
    (value) => {
      const authentication: KafkaAuthentication =
        value === KafkaAuthenticationMethod.SASL
          ? {
              method: KafkaAuthenticationMethod.SASL,
              username: "",
              password: "",
            }
          : { method: KafkaAuthenticationMethod.NONE };
      updateDraftEnvironment({
        ...draftEnvironmentBeingEdited!,
        authentication,
      });
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  const onSaslUsernameChange = useCallback(
    (value) => {
      if (
        draftEnvironmentBeingEdited!.authentication.method ===
        KafkaAuthenticationMethod.SASL
      ) {
        updateDraftEnvironment({
          ...draftEnvironmentBeingEdited!,
          authentication: {
            ...draftEnvironmentBeingEdited!.authentication,
            username: value,
          },
        });
      }
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  const onSaslPasswordChange = useCallback(
    (value) => {
      if (
        draftEnvironmentBeingEdited!.authentication.method ===
        KafkaAuthenticationMethod.SASL
      ) {
        updateDraftEnvironment({
          ...draftEnvironmentBeingEdited!,
          authentication: {
            ...draftEnvironmentBeingEdited!.authentication,
            password: value,
          },
        });
      }
    },
    [draftEnvironmentBeingEdited, updateDraftEnvironment]
  );

  if (!draftEnvironmentBeingEdited) {
    return <div>Not editing an env</div>;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="flex-1 px-3 mb-0">
          <TextInput
            onChange={onEnvironmentNameChange}
            value={draftEnvironmentBeingEdited.name}
            id="environment-name"
            label="Environment name"
            placeholder="Production, QA, Dev, etc"
            error={
              draftEnvironmentBeingEdited.name.length === 0
                ? "Please enter a name for the environment"
                : undefined
            }
          />
        </div>
        <div className="flex-1 px-3">
          <SelectInput
            onChange={onEnvironmentColorChange}
            value={draftEnvironmentBeingEdited.color}
            options={Object.keys(EnvironmentColor).map((color) => ({
              value: color,
              label: getColorLabel(color as EnvironmentColor),
            }))}
            id="environment-color"
            label="Color"
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <TextInput
            onChange={onBrokersChange}
            value={draftEnvironmentBeingEdited.brokers}
            id="broker-urls"
            label="Bootstrap servers"
            placeholder="localhost:9092"
            error={
              draftEnvironmentBeingEdited.brokers.length === 0
                ? "Please enter bootstrap servers for the environment"
                : undefined
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <SelectInput
            onChange={onAuthenticationMethodChange}
            value={draftEnvironmentBeingEdited.authentication.method}
            options={Object.keys(KafkaAuthenticationMethod).map((method) => ({
              value: method,
              label: getKafkaAuthenticationMethodLabel(
                method as KafkaAuthenticationMethod
              ),
            }))}
            id="kafka-authentication-method"
            label="Authentication method"
          />
        </div>
      </div>
      {draftEnvironmentBeingEdited.authentication.method ===
        KafkaAuthenticationMethod.SASL && (
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-1/2 px-3 mb-0">
            <TextInput
              onChange={onSaslUsernameChange}
              value={draftEnvironmentBeingEdited.authentication.username}
              id="sasl-username"
              label="Username"
              placeholder="Username"
              error={
                draftEnvironmentBeingEdited?.authentication.username.length ===
                0
                  ? "Please enter username"
                  : undefined
              }
            />
          </div>
          <div className="w-1/2 px-3">
            <TextInput
              onChange={onSaslPasswordChange}
              value={draftEnvironmentBeingEdited.authentication.password}
              id="sasl-password"
              label="Password"
              type="password"
              placeholder="Password"
              error={
                draftEnvironmentBeingEdited?.authentication.password.length ===
                0
                  ? "Please enter password"
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
