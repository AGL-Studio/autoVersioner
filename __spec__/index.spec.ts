import { checkForConf } from '../src/utils/config.js';
import { updateAllVersions } from '../src/utils/version.js';
import { pushToGit } from '../src/utils/git.js';

jest.mock('../src/utils/config.js', () => ({
  checkForConf: jest.fn()
}));
jest.mock('../src/utils/version.js', () => ({
  updateAllVersions: jest.fn()
}));
jest.mock('../src/utils/git.js', () => ({
  pushToGit: jest.fn()
}));

describe('index (CLI entry)', () => {
  it('should parse args and call main logic', async () => {
    process.argv = ['node', 'index.js', '--config', 'foo.json', '--project', 'main'];
    (checkForConf as jest.Mock).mockResolvedValue({ subprojects: [], files: [{ path: 'package.json', type: 'json' }] });
    (updateAllVersions as jest.Mock).mockResolvedValue({ main: '1.2.3' });
    (pushToGit as jest.Mock).mockResolvedValue(undefined);
    const { default: inquirer } = await import('inquirer');
    jest.spyOn(inquirer, 'prompt').mockResolvedValue({ versionType: 'patch', commitMessage: 'msg', selectedProjects: ['main'] });
    const { main } = await import('../src/index.js');
    await main();
    expect(checkForConf).toHaveBeenCalledWith('foo.json');
    expect(updateAllVersions).toHaveBeenCalled();
    expect(pushToGit).toHaveBeenCalled();
  });
});
