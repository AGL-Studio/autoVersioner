import { pushToGit } from '../../src/utils/git.js';
import simpleGit from 'simple-git';

jest.mock('simple-git');

const mockGit = {
  status: jest.fn(),
  add: jest.fn(),
  commit: jest.fn(),
  push: jest.fn(),
  addTag: jest.fn(),
  pushTags: jest.fn()
};

(simpleGit as jest.Mock).mockReturnValue(mockGit);

describe('git utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should not commit if no changes', async () => {
    mockGit.status.mockResolvedValueOnce({ files: [] });
    await pushToGit({ main: '1.2.3' }, 'msg');
    expect(mockGit.add).not.toHaveBeenCalled();
    expect(mockGit.commit).not.toHaveBeenCalled();
    expect(mockGit.push).not.toHaveBeenCalled();
  });
  it('should commit and push if there are changes', async () => {
    mockGit.status.mockResolvedValueOnce({ files: ['foo'] });
    await pushToGit({ main: '1.2.3' }, 'msg');
    expect(mockGit.add).toHaveBeenCalledWith('.');
    expect(mockGit.commit).toHaveBeenCalledWith(expect.stringContaining('msg'));
    expect(mockGit.push).toHaveBeenCalled();
  });
});
