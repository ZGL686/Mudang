import { useEffect, useState } from 'react';
import { assetUrl } from '../../lib/asset-url.js';

let engineLoad;

function loadEngine() {
  if (engineLoad) return engineLoad;
  engineLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = assetUrl('vendor/experience/engine.js');
    script.dataset.experienceEngine = '';
    script.onload = () => {
      Promise.resolve(window.__MUDANG_LEGACY_READY__).then(resolve, reject);
    };
    script.onerror = () => reject(new Error('互动长卷脚本加载失败，请刷新页面重试。'));
    document.body.append(script);
  });
  return engineLoad;
}

/**
 * The retained engine is an eager webpack application with document-wide listeners.
 * It is loaded once after React commits its DOM. Switching views uses full documents;
 * Vite also performs a full reload for experience edits instead of Fast Refresh.
 */
export function useExperienceEngine(readingOnly) {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (readingOnly) return undefined;
    let cancelled = false;
    const engineUrl = new URL(assetUrl('vendor/experience/engine.js'), document.baseURI).href;
    document.body.dataset.component = 'MobileResize';
    window.__MUDANG_BASE_URL__ = new URL(import.meta.env.BASE_URL, document.baseURI).pathname;
    window.loaderProgress = 0;

    const updateProgress = () => {
      if (cancelled) return;
      window.loaderProgress = Math.min(94, window.loaderProgress + 1);
      const progress = document.querySelector('#loader .loader-bar-animated');
      if (progress) progress.style.transform = `scaleX(${window.loaderProgress / 100})`;
      if (window.loaderProgress < 94) window.loaderTimeout = window.setTimeout(updateProgress, 40);
    };
    window.loaderTimeout = window.setTimeout(updateProgress, 200);

    const reportError = (reason) => {
      if (cancelled) return;
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(message || '互动长卷暂时无法启动。');
    };
    const onRuntimeError = (event) => {
      if (event.filename === engineUrl || event.error?.stack?.includes('/vendor/experience/engine.js')) {
        reportError(event.error || event.message);
      }
    };
    const onUnhandledRejection = (event) => {
      if (event.reason?.stack?.includes('/vendor/experience/engine.js')) reportError(event.reason);
    };
    window.addEventListener('error', onRuntimeError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    loadEngine().catch(reportError);

    return () => {
      cancelled = true;
      window.clearTimeout(window.loaderTimeout);
      window.removeEventListener('error', onRuntimeError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      // The graphics engine has no complete public dispose API. Removing its script
      // would not remove its listeners or GPU state; the next view loads a document.
    };
  }, [readingOnly]);

  return error;
}
