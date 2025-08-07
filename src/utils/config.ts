import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import Ajv from "ajv";
import schema from "./config.schema.json";

const DEFAULT_CONFIG_PATH = "autoVersioner.conf.json";

export interface ProjectConfig {
  files?: Array<{ path: string; type: 'json' | 'env'; field?: string }>;
  subprojects?: Array<{ dir: string; files?: Array<{ path: string; type: 'json' | 'env'; field?: string }> }>;
  changeEnv?: boolean;
  skipGitCheck?: boolean;
}

// Custom error class for configuration operations
class ConfigError extends Error {
  constructor(message: string, public readonly configPath?: string) {
    super(message);
    this.name = 'ConfigError';
  }
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
      const errors = validate.errors?.map(e => `${e.instancePath} ${e.message}`).join(', ');
      throw new ConfigError(`Config validation error: ${errors}`, configPath);
    }
    
    console.log(`Loaded configuration from ${configPath}`);
    return conf as ProjectConfig;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new ConfigError(`Error reading config file ${configPath}: ${message}`, configPath);
  }
};