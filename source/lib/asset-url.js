/** Public resources stay relative to the Vite deployment base, including subdirectories. */
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
