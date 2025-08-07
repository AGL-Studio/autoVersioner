import simpleGit from 'simple-git';

// Custom error class for Git operations
class GitError extends Error {
  constructor(message: string, public readonly operation?: string) {
    super(message);
    this.name = 'GitError';
  }
}

export const createAndPushTag = async (version: string): Promise<void> => {
  try {
    const git = simpleGit();
    const tagName = `ver-${version}`;
    await git.addTag(tagName);
    await git.pushTags();
    console.log(`🏷️  Tag created and pushed: ${tagName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GitError(`Failed to create and push tag: ${message}`, 'tag');
  }
};

export const pushToGit = async (
  versionUpdates: Record<string, string>,
  commitMessage: string
): Promise<void> => {
  try {
    const git = simpleGit();
    const status = await git.status();
    
    if (status.files.length === 0) {
      console.log('ℹ️  No changes to commit. Working tree clean.');
      return;
    }
    
    const versionInfo = Object.entries(versionUpdates)
      .map(([project, version]) => `${project}: v${version}`)
      .join(', ');
    
    const fullCommitMessage = versionInfo
      ? `${commitMessage} [${versionInfo}]`
      : commitMessage;
    
    await git.add('.');
    console.log('📝 Staged all changes for commit.');
    
    await git.commit(fullCommitMessage);
    console.log(`✅ Commit created: "${fullCommitMessage}"`);
    
    await git.push();
    console.log('🚀 Changes pushed to remote repository.');
    
    // Create tag for the main version or first available version
    const versionToTag = versionUpdates.main || versionUpdates.master || Object.values(versionUpdates)[0];
    if (versionToTag) {
      await createAndPushTag(versionToTag);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GitError(`Error pushing to Git: ${message}`, 'push');
  }
};