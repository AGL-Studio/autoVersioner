import { readFile, writeFile } from "node:fs/promises";

export const readJsonFile = async (path: string): Promise<any> => {
  console.log(`Reading JSON file at ${path}`);
  try {
    const data = await readFile(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading JSON file at ${path}:`, error.message);
    } else {
      console.error(`Error reading JSON file at ${path}:`, error);
    }
    throw error;
  }
};

export const writeJsonFile = async (path: string, data: object): Promise<void> => {
  console.log(`Writing JSON file at ${path}`);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await writeFile(path, jsonString);
    console.log(`✓ Successfully wrote to ${path}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error writing JSON file at ${path}:`, error.message);
    } else {
      console.error(`Error writing JSON file at ${path}:`, error);
    }
    throw error;
  }
};