import fs from 'fs/promises';
import path from 'path';
import { readJsonFile, writeJsonFile } from "./file.js";

const DEFAULT_PACKAGE_PATH = "package.json";

export interface FileConfig {
  path: string;
  type: 'json' | 'env';
  field?: string;
}

export interface SubprojectConfig {
  dir: string;
  files?: FileConfig[];
}

export interface ProjectConfig {
  files?: FileConfig[];
  subprojects?: SubprojectConfig[];
  changeEnv?: boolean;
  skipGitCheck?: boolean;
}

export type VersionType = 'major' | 'minor' | 'patch';
export type VersionUpdates = Record<string, string>;

const getCurrentVersion = async (filePath: string): Promise<string> => {
  try {
    console.log(`📖 Reading version from: ${filePath}`);
    const data = await fs.readFile(filePath, 'utf8');
    const packageJson = JSON.parse(data);
    console.log(`🔎 Current version found: ${packageJson.version}`);
    return packageJson.version;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Failed to read version from ${filePath}:`, error.message);
    } else {
      console.error(`❌ Failed to read version from ${filePath}:`, error);
    }
    throw error;
  }
};

const updateJsonVersion = async (filePath: string, field: string, newVersion: string): Promise<boolean> => {
  try {
    console.log(`🛠️  Updating JSON file ${filePath}, field ${field} to ${newVersion}`);
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);
    json[field] = newVersion;
    await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Failed to update version in ${filePath}:`, error.message);
    } else {
      console.error(`❌ Failed to update version in ${filePath}:`, error);
    }
    return false;
  }
};

const updateEnvVersion = async (filePath: string, field: string, newVersion: string): Promise<boolean> => {
  try {
    console.log(`🛠️  Updating ENV file ${filePath}, field ${field} to ${newVersion}`);
    let data = await fs.readFile(filePath, 'utf8');
    
    // Check if the field exists and log only the field name, not the value
    const fieldExists = data.match(new RegExp(`^${field}=.*$`, 'm'));
    if (fieldExists) {
      console.log(`🔎 Found field ${field} in ENV file`);
    } else {
      console.log(`⚠️  Field ${field} not found in ENV file`);
    }
    
    const regex = new RegExp(`^${field}=.*$`, 'm');
    data = data.replace(regex, `${field}=${newVersion}`);
    await fs.writeFile(filePath, data, 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Failed to update version in ${filePath}:`, error.message);
    } else {
      console.error(`❌ Failed to update version in ${filePath}:`, error);
    }
    return false;
  }
};

export const calculateNewVersion = (currentVersion: string, versionType: VersionType): string => {
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

const resolvePath = (baseDir: string | undefined, filePath: string): string => {
  if (!baseDir) return filePath;
  return path.join(baseDir, filePath);
};

export const updateAllVersions = async (
  versionType: VersionType,
  config: ProjectConfig,
  projectsToUpdate: string[] = ['main', ...(config.subprojects?.map(p => p.dir) || [])]
): Promise<VersionUpdates> => {
  console.log(`🔄 Updating versions for projects: ${projectsToUpdate.join(', ')}`);
  
  const versionUpdates: VersionUpdates = {};
  
  if (projectsToUpdate.includes('main')) {
    const mainPackageFile = config.files?.find(f => f.path.endsWith('package.json') && f.type === 'json');
    
    if (mainPackageFile) {
      const mainVersion = await getCurrentVersion(mainPackageFile.path);
      const newVersion = calculateNewVersion(mainVersion, versionType);
      console.log(`📦 Main project: ${mainVersion} -> ${newVersion}`);
      
      for (const file of config.files || []) {
        if (file.type === 'json') {
          await updateJsonVersion(file.path, file.field || 'version', newVersion);
        } else if (file.type === 'env' && file.field) {
          await updateEnvVersion(file.path, file.field, newVersion);
        }
      }
      
      versionUpdates.main = newVersion;
      console.log(`✅ Updated main project version to ${newVersion}`);
    }
  }
  
  if (config.subprojects) {
    for (const subproject of config.subprojects) {
      if (projectsToUpdate.includes(subproject.dir)) {
        const subPackageFile = subproject.files?.find(f => f.path.endsWith('package.json') && f.type === 'json');
        
        if (subPackageFile) {
          const fullPath = path.join(subproject.dir, subPackageFile.path);
          const currentVersion = await getCurrentVersion(fullPath);
          const newVersion = calculateNewVersion(currentVersion, versionType);
          console.log(`📁 ${subproject.dir} project: ${currentVersion} -> ${newVersion}`);
          
          for (const file of subproject.files || []) {
            const filePath = path.join(subproject.dir, file.path);
            if (file.type === 'json') {
              await updateJsonVersion(filePath, file.field || 'version', newVersion);
            } else if (file.type === 'env' && file.field) {
              console.log(`🛠️  Attempting to update ENV file: ${filePath} with field: ${file.field}`);
              await updateEnvVersion(filePath, file.field, newVersion);
            }
          }
          
          versionUpdates[subproject.dir] = newVersion;
          console.log(`✅ Updated ${subproject.dir} project version to ${newVersion}`);
        } else {
          console.warn(`⚠️  No package.json found for subproject: ${subproject.dir}`);
        }
      }
    }
  }
  
  return versionUpdates;
};

export const updatePackageVersion = async (
  versionType: VersionType,
  packagePath: string = DEFAULT_PACKAGE_PATH,
  customVersion: string | null = null
): Promise<string> => {
  if (customVersion) {
    const packageJson = await readJsonFile(packagePath);
    console.log(`🛠️  Updating version ${packageJson.version} -> ${customVersion} in ${packagePath}`);
    packageJson.version = customVersion;
    await writeJsonFile(packagePath, packageJson);
    return customVersion;
  } else {
    const packageJson = await readJsonFile(packagePath);
    const currentVersion = packageJson.version;
    const newVersion = calculateNewVersion(currentVersion, versionType);
    console.log(`🛠️  Updating version ${currentVersion} -> ${newVersion} in ${packagePath}`);
    packageJson.version = newVersion;
    await writeJsonFile(packagePath, packageJson);
    return newVersion;
  }
};

export const updateEnv = async (
  newVersion: string,
  envPath: string,
  envVersionValue: string
): Promise<boolean> => {
  return updateEnvVersion(envPath, envVersionValue, newVersion);
};