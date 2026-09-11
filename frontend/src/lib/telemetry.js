/**
 * Lightweight, privacy-conscious analytics beacon.
 *
 * No cookies and no cross-site identifiers: the session id lives in
 * sessionStorage, so it disappears when the tab closes and never follows a
 * visitor to another site. The server stores only a salted hash of the IP.
 */

const SESSION_KEY = 'lupus_sid';

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null; // private mode, storage disabled
  }
}

/** Sends an event. Never throws and never blocks rendering. */
export function trackEvent(type, { label, meta } = {}) {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // survives the page being unloaded
      body: JSON.stringify({
        type,
        label,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        sessionId: sessionId(),
        meta: meta || {},
      }),
    }).catch(() => {});
  } catch {
    // Analytics must never break the page.
  }
}

/** Records the initial page view, once per load. */
export function trackPageView() {
  trackEvent('PAGE_VIEW');
}
