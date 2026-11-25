import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'public');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const standalonePublic = path.join(standaloneDir, 'public');
const standaloneStatic = path.join(standaloneDir, '.next', 'static');
const buildStatic = path.join(rootDir, '.next', 'static');

console.log('[copy-public] Syncing static assets for standalone deployment...');

if (fs.existsSync(standaloneDir)) {
  if (fs.existsSync(sourceDir)) {
    fs.cpSync(sourceDir, standalonePublic, { recursive: true, force: true });
    console.log('[copy-public] Copied public/ -> .next/standalone/public/');
  }
  if (fs.existsSync(buildStatic)) {
    fs.cpSync(buildStatic, standaloneStatic, { recursive: true, force: true });
    console.log('[copy-public] Copied .next/static/ -> .next/standalone/.next/static/');
  }
} else {
  console.log('[copy-public] .next/standalone not found, skipping standalone copy.');
}
