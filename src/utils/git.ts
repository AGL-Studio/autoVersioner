import simpleGit from 'simple-git';

export const createAndPushTag = async (version: string): Promise<void> => {
  try {
    const git = simpleGit();
    const tagName = `ver-${version}`;
    await git.addTag(tagName);
    await git.pushTags();
    console.log(`🏷️  Tag created and pushed: ${tagName}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Failed to create and push tag:', error.message);
    } else {
      console.error('❌ Failed to create and push tag:', error);
    }
    throw error;
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
    const versionToTag = versionUpdates.main || versionUpdates.master || Object.values(versionUpdates)[0];
    if (versionToTag) {
      await createAndPushTag(versionToTag);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error pushing to Git:', error.message);
    } else {
      console.error('❌ Error pushing to Git:', error);
    }
    throw error;
  }
};