import { assetUrl } from '../../lib/asset-url.js';

/** The graphics runtime owns a document. Navigation must create a fresh document. */
export function ExperienceLink({ to, children, className = '', ...props }) {
  // The vendor router explicitly excludes .no-history, so a native link keeps
  // document navigation, keyboard activation and modified clicks intact.
  return <a {...props} className={`no-history ${className}`} href={assetUrl(to)}>{children}</a>;
}
