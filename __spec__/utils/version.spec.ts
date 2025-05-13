import { calculateNewVersion } from '../../src/utils/version.js';

// Mock fs promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

describe('Version utility', () => {
  describe('calculateNewVersion', () => {
    test('should increment major version', () => {
      expect(calculateNewVersion('1.2.3', 'major')).toBe('2.0.0');
    });

    test('should increment minor version', () => {
      expect(calculateNewVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    test('should increment patch version', () => {
      expect(calculateNewVersion('1.2.3', 'patch')).toBe('1.2.4');
    });
  });
});