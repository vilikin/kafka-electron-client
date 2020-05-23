import React, { FunctionComponent, useCallback } from "react";
import { useActions, useOvermindState } from "../../overmind";
import { TextInput } from "../Form/TextInput";
import { SelectInput } from "../Form/SelectInput";
import { Button } from "../Form/Button";
import {
  EnvironmentColor,
  getColorLabel,
  getKafkaAuthenticationMethodLabel,
  KafkaAuthentication,
  KafkaAuthenticationMethod,
} from "../../models/environments";
import { defaultTailwindColor } from "../../constants";

export const EnvironmentEditor: FunctionComponent = () => {
  const {
    draftEnvironment,
    draftEnvironmentIsNew,
    draftContainsChanges,
  } = useOvermindState();
  const {
    updateDraftEnvironment,
    saveDraftEnvironment,
    removeEnvironment,
    discardDraftEnvironment,
  } = useActions();

  const onEnvironmentNameChange = useCallback(
    (value) => {
      updateDraftEnvironment({ ...draftEnvironment!, name: value });
    },
    [draftEnvironment, updateDraftEnvironment]
  );

  const onEnvironmentColorChange = useCallback(
    (value) => {
      updateDraftEnvironment({ ...draftEnvironment!, color: value });
    },
    [draftEnvironment, updateDraftEnvironment]
  );

  const onBrokersChange = useCallback(
    (value) => {
      updateDraftEnvironment({ ...draftEnvironment!, brokers: value });
    },
    [draftEnvironment, updateDraftEnvironment]
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
      updateDraftEnvironment({ ...draftEnvironment!, authentication });
    },
    [draftEnvironment, updateDraftEnvironment]
  );

  const onSaslUsernameChange = useCallback(
    (value) => {
      if (
        draftEnvironment!.authentication.method ===
        KafkaAuthenticationMethod.SASL
      ) {
        updateDraftEnvironment({
          ...draftEnvironment!,
          authentication: {
            ...draftEnvironment!.authentication,
            username: value,
          },
        });
      }
    },
    [draftEnvironment, updateDraftEnvironment]
  );

  const onSaslPasswordChange = useCallback(
    (value) => {
      if (
        draftEnvironment!.authentication.method ===
        KafkaAuthenticationMethod.SASL
      ) {
        updateDraftEnvironment({
          ...draftEnvironment!,
          authentication: {
            ...draftEnvironment!.authentication,
            password: value,
          },
        });
      }
    },
    [draftEnvironment, updateDraftEnvironment]
  );

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();

      saveDraftEnvironment();
    },
    [draftEnvironment, saveDraftEnvironment]
  );

  const onRemove = useCallback(() => {
    removeEnvironment(draftEnvironment!.id);
    discardDraftEnvironment();
  }, [draftEnvironment, removeEnvironment, discardDraftEnvironment]);

  if (!draftEnvironment) {
    return <div>Not editing an env</div>;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-1/2 px-3 mb-0">
          <TextInput
            onChange={onEnvironmentNameChange}
            value={draftEnvironment.name}
            id="environment-name"
            label="Environment name"
            placeholder="Production, QA, Dev, etc"
            required={true}
          />
        </div>
        <div className="w-1/2 px-3">
          <SelectInput
            onChange={onEnvironmentColorChange}
            value={draftEnvironment.color}
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
            value={draftEnvironment.brokers}
            id="broker-urls"
            label="Bootstrap servers"
            placeholder="localhost:9092"
            required={true}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <SelectInput
            onChange={onAuthenticationMethodChange}
            value={draftEnvironment.authentication.method}
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
      {draftEnvironment.authentication.method ===
        KafkaAuthenticationMethod.SASL && (
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-1/2 px-3 mb-0">
            <TextInput
              onChange={onSaslUsernameChange}
              value={draftEnvironment.authentication.username}
              id="sasl-username"
              label="Username"
              placeholder="Username"
              required={true}
            />
          </div>
          <div className="w-1/2 px-3">
            <TextInput
              onChange={onSaslPasswordChange}
              value={draftEnvironment.authentication.password}
              id="sasl-password"
              label="Password"
              type="password"
              placeholder="Password"
              required={true}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-end">
        {draftEnvironmentIsNew ? (
          <Button
            text="Cancel"
            color="gray"
            onClick={discardDraftEnvironment}
          />
        ) : (
          <Button text="Remove" color="red" onClick={onRemove} />
        )}
        <Button
          text={draftEnvironmentIsNew ? "Save" : "Save changes"}
          type="submit"
          color={defaultTailwindColor}
          className="ml-2"
          disabled={!draftEnvironmentIsNew && !draftContainsChanges}
        />
      </div>
    </form>
  );
};
