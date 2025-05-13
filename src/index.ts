#!/usr/bin/env node
import inquirer from "inquirer";
import { checkForConf } from "./utils/config.js";
import { updateAllVersions, VersionType } from "./utils/version.js";
import { pushToGit } from "./utils/git.js";

const VALID_VERSION_TYPES: VersionType[] = ["major", "minor", "patch"];

interface ParsedArgs {
  configPath: string | null;
  projects: string[];
}

const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2);
  const config: ParsedArgs = {
    configPath: null,
    projects: []
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--config" || args[i] === "-c") {
      config.configPath = args[i + 1];
      i++;
    } else if (args[i] === "--project" || args[i] === "-p") {
      config.projects.push(args[i + 1]);
      i++;
    }
  }

  return config;
};

const main = async (): Promise<void> => {
  const { configPath, projects } = parseArgs();
  const conf = await checkForConf(configPath ?? undefined);

  const availableProjects = ["main", ...(conf.subprojects || []).map(p => p.dir)];
  // Dynamically import inquirer for ESM/CJS compatibility
  const inquirerModule = await import("inquirer");
  // Always use .default, as inquirer v12+ is ESM-only and exports prompt on default
  const inquirerPrompt = inquirerModule.default.prompt;

  const answers = await inquirerPrompt([
    {
      type: "list",
      name: "versionType",
      message: "What type of change?",
      choices: VALID_VERSION_TYPES,
    },
    {
      type: "checkbox",
      name: "selectedProjects",
      message: "Which projects to update?",
      choices: availableProjects,
      default: projects.length ? projects : availableProjects,
      when: () => !projects.length && conf.subprojects && conf.subprojects.length > 0
    },
    {
      type: "input",
      name: "commitMessage",
      message: "Enter the commit message:",
    },
    {
      type: "confirm",
      name: "updateEnv",
      message: "Do you want to update the .env file?",
      default: false,
      when: () => conf.changeEnv === undefined && !conf.files,
    },
  ]);

  const { versionType, commitMessage } = answers as { versionType: VersionType; commitMessage: string };
  
  const workingConfig = { ...conf };
  if (conf.changeEnv === undefined && !conf.files) {
    workingConfig.changeEnv = answers.updateEnv;
  }
  
  const projectsToUpdate: string[] = projects.length ? projects : answers.selectedProjects || availableProjects;

  const newVersions = await updateAllVersions(versionType, workingConfig, projectsToUpdate);

  if (!conf.skipGitCheck) {
    await pushToGit(newVersions, commitMessage);
  }
};

main().catch((error: unknown) => {
  if (error instanceof Error) {
    if (error.message.startsWith("Config validation error") || error.message.startsWith("Error reading config file")) {
      console.error("Configuration error:", error.message);
      process.exit(2);
    } else {
      console.error("Error in main execution:", error.message);
      process.exit(1);
    }
  } else {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
});

export { main };