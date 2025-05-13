import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import Ajv from "ajv";
import schema from "./config.schema.json";

const DEFAULT_CONFIG_PATH = "autoVersioner.conf.json";

export interface ProjectConfig {
  files?: Array<{ path: string; type: 'json' | 'env'; field?: string; key?: string }>;
  subprojects?: Array<{ dir: string; files?: Array<{ path: string; type: 'json' | 'env'; field?: string; key?: string }> }>;
  changeEnv?: boolean;
  skipGitCheck?: boolean;
}

export const checkForConf = async (customConfigPath?: string): Promise<ProjectConfig> => {
  const configPath = customConfigPath || DEFAULT_CONFIG_PATH;
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  try {
    if (!existsSync(configPath)) {
      console.log(`No config file found at ${configPath}, using defaults`);
      return { changeEnv: false };
    }

    const confData = await readFile(configPath, "utf8");
    const conf = JSON.parse(confData);
    if (!validate(conf)) {
      console.error("Config validation error:", validate.errors);
      throw new Error("Config validation error");
    }
    console.log(`Loaded configuration from ${configPath}`);
    return conf as ProjectConfig;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading config file ${configPath}:`, error.message);
      throw new Error(`Error reading config file ${configPath}: ${error.message}`);
    } else {
      console.error(`Error reading config file ${configPath}:`, error);
      throw new Error(`Error reading config file ${configPath}: ${error}`);
    }
  }
};