export declare const createAndPushTag: (version: string) => Promise<void>;
export declare const pushToGit: (versionUpdates: Record<string, string>, commitMessage: string) => Promise<void>;
