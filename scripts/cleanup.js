#!/usr/bin/env node

import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UNNECESSARY_DIRS = [
  'client',
  'server', 
  'test-env',
  'docs'
];

const UNNECESSARY_FILES = [
  'test-config.json'
];

async function cleanup() {
  console.log('🧹 Cleaning up unnecessary files...');
  
  // Remove unnecessary directories
  for (const dir of UNNECESSARY_DIRS) {
    if (existsSync(dir)) {
      try {
        await rm(dir, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${dir}`);
      } catch (error) {
        console.log(`⚠️  Could not remove ${dir}: ${error.message}`);
      }
    }
  }
  
  // Remove unnecessary files
  for (const file of UNNECESSARY_FILES) {
    if (existsSync(file)) {
      try {
        await rm(file, { force: true });
        console.log(`✅ Removed file: ${file}`);
      } catch (error) {
        console.log(`⚠️  Could not remove ${file}: ${error.message}`);
      }
    }
  }
  
  console.log('✨ Cleanup completed!');
}

cleanup().catch(console.error);
