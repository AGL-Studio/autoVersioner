import { readJsonFile, writeJsonFile } from '../../src/utils/file.js';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

describe('file utils', () => {
  describe('readJsonFile', () => {
    it('should parse valid JSON', async () => {
      const mockData = JSON.stringify({ foo: 'bar' });
      const fs = require('node:fs/promises');
      fs.readFile.mockResolvedValueOnce(mockData);
      const result = await readJsonFile('test.json');
      expect(result).toEqual({ foo: 'bar' });
    });
    it('should throw on invalid JSON', async () => {
      const fs = require('node:fs/promises');
      fs.readFile.mockResolvedValueOnce('not json');
      await expect(readJsonFile('bad.json')).rejects.toThrow();
    });
  });
  describe('writeJsonFile', () => {
    it('should write JSON string', async () => {
      const fs = require('node:fs/promises');
      await writeJsonFile('test.json', { foo: 'bar' });
      expect(fs.writeFile).toHaveBeenCalledWith('test.json', JSON.stringify({ foo: 'bar' }, null, 2));
    });
  });
});
