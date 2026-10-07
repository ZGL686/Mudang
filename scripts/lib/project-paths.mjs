import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const dataPath = name => path.join(projectRoot, 'source', 'data', name);
export const qaPath = (...parts) => path.join(projectRoot, 'docs', 'qa', 'current', ...parts);

// Manifest URLs are served by Vite from public/. Keep Node checks on the same files.
export function runtimeAssetPath(url) {
  const relative = url.replace(/^\/+/, '');
  const resolved = path.resolve(projectRoot, 'public', relative);
  const publicRoot = path.join(projectRoot, 'public') + path.sep;
  if (!resolved.startsWith(publicRoot)) throw new Error(`Asset escapes public/: ${url}`);
  return resolved;
}
