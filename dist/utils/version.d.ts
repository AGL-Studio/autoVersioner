export interface FileConfig {
    path: string;
    type: 'json' | 'env';
    field?: string;
    key?: string;
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
export declare const calculateNewVersion: (currentVersion: string, versionType: VersionType) => string;
export declare const updateAllVersions: (versionType: VersionType, config: ProjectConfig, projectsToUpdate?: string[]) => Promise<VersionUpdates>;
export declare const updatePackageVersion: (versionType: VersionType, packagePath?: string, customVersion?: string | null) => Promise<string>;
export declare const updateEnv: (newVersion: string, envPath: string, envVersionValue: string) => Promise<boolean>;
