/** Absolute URLs also work in CSS variables consumed from a nested stylesheet. */
export function assetUrl(path) {
  return new URL(`${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, document.baseURI).href;
}
