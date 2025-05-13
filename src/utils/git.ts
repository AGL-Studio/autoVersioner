import simpleGit from 'simple-git';

export const pushToGit = async (
  versionUpdates: Record<string, string>,
  commitMessage: string
): Promise<void> => {
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
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error pushing to Git:', error.message);
    } else {
      console.error('Error pushing to Git:', error);
    }
    throw error;
  }
};