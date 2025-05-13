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
  it('parses config file if exists', async () => {
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    fs.existsSync.mockReturnValue(true);
    fsp.readFile.mockResolvedValueOnce('{"changeEnv":true}');
    const conf = await checkForConf('exists.json');
    expect(conf).toEqual({ changeEnv: true });
  });
  it('returns default config on parse error', async () => {
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    fs.existsSync.mockReturnValue(true);
    fsp.readFile.mockResolvedValueOnce('not json');
    const conf = await checkForConf('bad.json');
    expect(conf).toEqual({ changeEnv: false });
  });
});
