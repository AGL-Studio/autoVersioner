import { readFile, writeFile } from "node:fs/promises";

// Custom error class for file operations
class FileError extends Error {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = 'FileError';
  }
}

export const readJsonFile = async (path: string): Promise<any> => {
  try {
    const data = await readFile(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FileError(`Error reading JSON file at ${path}: ${message}`, path);
  }
};

export const writeJsonFile = async (path: string, data: object): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await writeFile(path, jsonString, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FileError(`Error writing JSON file at ${path}: ${message}`, path);
  }
};