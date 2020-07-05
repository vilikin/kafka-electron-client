import { Environment } from "../models/environments";
import { KafkaBackendClient } from "../kafka/kafka-backend-client";

const { remote } = window.require("electron");
const fs = window.require("fs").promises;
const path = window.require("path");

const userDataPath = remote.app.getPath("userData");
const configPath = path.join(userDataPath, "config.json");

export interface AppConfig {
  environments: Environment[];
}

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

export const kafka = new KafkaBackendClient();
