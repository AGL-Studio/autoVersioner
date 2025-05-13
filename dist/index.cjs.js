#!/usr/bin/env node
'use strict';

var inquirer = require('inquirer');
var promises = require('node:fs/promises');
var node_fs = require('node:fs');
var fs = require('fs/promises');
var path = require('path');
var simpleGit = require('simple-git');

const DEFAULT_CONFIG_PATH = "versionBump.conf.json";
const checkForConf = async (customConfigPath) => {
    const configPath = customConfigPath || DEFAULT_CONFIG_PATH;
    try {
        if (!node_fs.existsSync(configPath)) {
            console.log(`No config file found at ${configPath}, using defaults`);
            return { changeEnv: false };
        }
        const confData = await promises.readFile(configPath, "utf8");
        const conf = JSON.parse(confData);
        console.log(`Loaded configuration from ${configPath}`);
        return conf;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error reading config file ${configPath}:`, error.message);
        }
        else {
            console.error(`Error reading config file ${configPath}:`, error);
        }
        return { changeEnv: false };
    }
};

const getCurrentVersion = async (filePath) => {
    try {
        console.log(`Reading version from: ${filePath}`);
        const data = await fs.readFile(filePath, 'utf8');
        const packageJson = JSON.parse(data);
        console.log(`Current version found: ${packageJson.version}`);
        return packageJson.version;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to read version from ${filePath}:`, error.message);
        }
        else {
            console.error(`Failed to read version from ${filePath}:`, error);
        }
        throw error;
    }
};
const updateJsonVersion = async (filePath, field, newVersion) => {
    try {
        console.log(`Updating JSON file ${filePath}, field ${field} to ${newVersion}`);
        const data = await fs.readFile(filePath, 'utf8');
        const json = JSON.parse(data);
        json[field] = newVersion;
        await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8');
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to update version in ${filePath}:`, error.message);
        }
        else {
            console.error(`Failed to update version in ${filePath}:`, error);
        }
        return false;
    }
};
const updateEnvVersion = async (filePath, key, newVersion) => {
    try {
        console.log(`Updating ENV file ${filePath}, key ${key} to ${newVersion}`);
        let data = await fs.readFile(filePath, 'utf8');
        // Log the current content to debug
        console.log(`Current ENV content for key ${key}:`, data.match(new RegExp(`^${key}=(.*)$`, 'm')));
        const regex = new RegExp(`^${key}=.*$`, 'm');
        data = data.replace(regex, `${key}=${newVersion}`);
        await fs.writeFile(filePath, data, 'utf8');
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to update version in ${filePath}:`, error.message);
        }
        else {
            console.error(`Failed to update version in ${filePath}:`, error);
        }
        return false;
    }
};
const calculateNewVersion = (currentVersion, versionType) => {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    switch (versionType) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error(`Invalid version type: ${versionType}`);
    }
};
const updateAllVersions = async (versionType, config, projectsToUpdate) => {
    var _a, _b, _c;
    if (projectsToUpdate === void 0) { projectsToUpdate = ['main', ...(((_a = config.subprojects) === null || _a === void 0 ? void 0 : _a.map(p => p.dir)) || [])]; }
    console.log(`Updating versions for projects: ${projectsToUpdate.join(', ')}`);
    const versionUpdates = {};
    if (projectsToUpdate.includes('main')) {
        const mainPackageFile = (_b = config.files) === null || _b === void 0 ? void 0 : _b.find(f => f.path.endsWith('package.json') && f.type === 'json');
        if (mainPackageFile) {
            const mainVersion = await getCurrentVersion(mainPackageFile.path);
            const newVersion = calculateNewVersion(mainVersion, versionType);
            console.log(`Main project: ${mainVersion} -> ${newVersion}`);
            for (const file of config.files || []) {
                if (file.type === 'json') {
                    await updateJsonVersion(file.path, file.field || 'version', newVersion);
                }
                else if (file.type === 'env' && file.key) {
                    await updateEnvVersion(file.path, file.key, newVersion);
                }
            }
            versionUpdates.main = newVersion;
            console.log(`Updated main project version to ${newVersion}`);
        }
    }
    if (config.subprojects) {
        for (const subproject of config.subprojects) {
            if (projectsToUpdate.includes(subproject.dir)) {
                const subPackageFile = (_c = subproject.files) === null || _c === void 0 ? void 0 : _c.find(f => f.path.endsWith('package.json') && f.type === 'json');
                if (subPackageFile) {
                    const fullPath = path.join(subproject.dir, subPackageFile.path);
                    const currentVersion = await getCurrentVersion(fullPath);
                    const newVersion = calculateNewVersion(currentVersion, versionType);
                    console.log(`${subproject.dir} project: ${currentVersion} -> ${newVersion}`);
                    for (const file of subproject.files || []) {
                        const filePath = path.join(subproject.dir, file.path);
                        if (file.type === 'json') {
                            await updateJsonVersion(filePath, file.field || 'version', newVersion);
                        }
                        else if (file.type === 'env' && file.key) {
                            console.log(`Attempting to update ENV file: ${filePath} with key: ${file.key}`);
                            await updateEnvVersion(filePath, file.key, newVersion);
                        }
                    }
                    versionUpdates[subproject.dir] = newVersion;
                    console.log(`Updated ${subproject.dir} project version to ${newVersion}`);
                }
                else {
                    console.warn(`No package.json found for subproject: ${subproject.dir}`);
                }
            }
        }
    }
    return versionUpdates;
};

const pushToGit = async (versionUpdates, commitMessage) => {
    try {
        const git = simpleGit();
        const status = await git.status();
        if (status.files.length === 0) {
            console.log('No changes to commit.');
            return;
        }
        const versionInfo = Object.entries(versionUpdates)
            .map(([project, version]) => `${project}: v${version}`)
            .join(', ');
        const fullCommitMessage = `${commitMessage} [${versionInfo}]`;
        await git.add('.');
        await git.commit(fullCommitMessage);
        await git.push();
        console.log(`Changes committed and pushed to Git: ${fullCommitMessage}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error pushing to Git:', error.message);
        }
        else {
            console.error('Error pushing to Git:', error);
        }
        throw error;
    }
};

const VALID_VERSION_TYPES = ["major", "minor", "patch"];
const parseArgs = () => {
    const args = process.argv.slice(2);
    const config = {
        configPath: null,
        projects: []
    };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--config" || args[i] === "-c") {
            config.configPath = args[i + 1];
            i++;
        }
        else if (args[i] === "--project" || args[i] === "-p") {
            config.projects.push(args[i + 1]);
            i++;
        }
    }
    return config;
};
const main = async () => {
    const { configPath, projects } = parseArgs();
    const conf = await checkForConf(configPath !== null && configPath !== void 0 ? configPath : undefined);
    const availableProjects = ["main", ...(conf.subprojects || []).map(p => p.dir)];
    const answers = await inquirer.prompt([
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
    const { versionType, commitMessage } = answers;
    const workingConfig = { ...conf };
    if (conf.changeEnv === undefined && !conf.files) {
        workingConfig.changeEnv = answers.updateEnv;
    }
    const projectsToUpdate = projects.length ? projects : answers.selectedProjects || availableProjects;
    const newVersions = await updateAllVersions(versionType, workingConfig, projectsToUpdate);
    if (!conf.skipGitCheck) {
        await pushToGit(newVersions, commitMessage);
    }
};
main().catch((error) => {
    if (error instanceof Error) {
        console.error("Error in main execution:", error.message);
    }
    else {
        console.error("Error in main execution:", error);
    }
    process.exit(1);
});
//# sourceMappingURL=index.cjs.js.map
