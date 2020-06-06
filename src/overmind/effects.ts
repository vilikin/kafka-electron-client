import page from "page";
import { Environment } from "../models/environments";
import { KafkaClient } from "../kafka/kafka-client";

const { remote } = window.require("electron");
const fs = window.require("fs").promises;
const path = window.require("path");

const userDataPath = remote.app.getPath("userData");
const configPath = path.join(userDataPath, "config.json");

export interface AppConfig {
  environments: Environment[];
}

export type Params = {
  [key: string]: string;
};

export const router = {
  initialize(routes: { [url: string]: (params: Params) => void }) {
    Object.keys(routes).forEach((url) => {
      page(url, ({ params }) => routes[url](params));
    });
    page.start({ hashbang: true });
  },
  open: (url: string) => page.show(url),
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
