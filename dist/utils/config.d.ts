export interface ProjectConfig {
    files?: Array<{
        path: string;
        type: 'json' | 'env';
        field?: string;
        key?: string;
    }>;
    subprojects?: Array<{
        dir: string;
        files?: Array<{
            path: string;
            type: 'json' | 'env';
            field?: string;
            key?: string;
        }>;
    }>;
    changeEnv?: boolean;
    skipGitCheck?: boolean;
}
export declare const checkForConf: (customConfigPath?: string) => Promise<ProjectConfig>;
