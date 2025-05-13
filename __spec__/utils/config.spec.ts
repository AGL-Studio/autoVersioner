import { checkForConf } from '../../src/utils/config.js';

jest.mock('node:fs', () => ({
  existsSync: jest.fn()
}));
jest.mock('node:fs/promises', () => ({
  readFile: jest.fn()
}));

describe('config utils', () => {
  it('returns default config if file does not exist', async () => {
    const fs = require('node:fs');
    fs.existsSync.mockReturnValue(false);
    const conf = await checkForConf('missing.json');
    expect(conf).toEqual({ changeEnv: false });
  });
  it('parses config file with all properties', async () => {
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    fs.existsSync.mockReturnValue(true);
    const configObj = {
      changeEnv: true,
      skipGitCheck: true,
      files: [
        { path: 'package.json', type: 'json', field: 'version' },
        { path: '.env', type: 'env', key: 'APP_VERSION' }
      ],
      subprojects: [
        {
          dir: 'packages/foo',
          files: [
            { path: 'foo.json', type: 'json', field: 'version' }
          ]
        }
      ]
    };
    fsp.readFile.mockResolvedValueOnce(JSON.stringify(configObj));
    const conf = await checkForConf('exists.json');
    expect(conf).toEqual(configObj);
  });
  it('throws on parse error', async () => {
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    fs.existsSync.mockReturnValue(true);
    fsp.readFile.mockResolvedValueOnce('not json');
    await expect(checkForConf('bad.json')).rejects.toThrow('Error reading config file');
  });
  it('throws on schema validation error', async () => {
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    fs.existsSync.mockReturnValue(true);
    // missing required "type" in files
    const badConfig = { files: [{ path: 'package.json' }] };
    fsp.readFile.mockResolvedValueOnce(JSON.stringify(badConfig));
    await expect(checkForConf('bad-schema.json')).rejects.toThrow('Config validation error');
  });
});
