import page from "page";
import { Action } from "overmind";
import * as queryString from "querystring";
import { Environment } from "../models/environments";
import { Admin, Consumer, KafkaConfig, Producer } from "kafkajs";
import { KafkaClient } from "../kafka/kafka-client";
const { remote } = window.require("electron");
const fs = window.require("fs").promises;
const path = window.require("path");

const userDataPath = remote.app.getPath("userData");
const configPath = path.join(userDataPath, "config.json");

export interface AppConfig {
  environments: Environment[];
}

export const router = {
  route(route: string, action: Action) {
    page(route, ({ params, querystring }) => {
      const payload = Object.assign({}, params, queryString.parse(querystring));
      action(payload);
    });
  },
  start: () => page.start({ hashbang: true }),
  open: (path: string) => page.show(path),
};

export const store = {
  async saveConfig(config: AppConfig) {
    const serializedConfig = JSON.stringify(config, null, 4);
    await fs.writeFile(configPath, serializedConfig);
  },
  async loadConfig(): Promise<AppConfig> {
    try {
      const configString = await fs.readFile(configPath, "utf-8");
      return JSON.parse(configString);
    } catch (e) {
      return {
        environments: [],
      };
    }
  },
};

export const kafka = new KafkaClient();
