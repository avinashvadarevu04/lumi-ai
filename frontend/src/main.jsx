import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

const renderPublicSite = () =>
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

/**
 * Compares the first path segment against the build-time digest of the admin
 * base path. The literal path is never present in this bundle, so reading the
 * public JavaScript does not reveal where the operations gateway lives.
 */
async function isOperationsGateway() {
  const segment = `/${window.location.pathname.split('/')[1] || ''}`;
  if (segment === '/') return false;

  // Web Crypto needs a secure context: https, or localhost during development.
  if (!globalThis.crypto?.subtle) return false;

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(segment));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return hex === __ADMIN_PATH_HASH__;
}

/**
 * The dashboard is a separate chunk that is only requested once the path
 * matches, so visitors to the public site never download a byte of admin code.
 */
isOperationsGateway()
  .then((isAdmin) => {
    if (!isAdmin) {
      renderPublicSite();
      return null;
    }
    document.title = 'Operations Gateway';
    return import('./admin/AdminApp.jsx').then(({ default: AdminApp }) => {
      root.render(
        <StrictMode>
          <AdminApp />
        </StrictMode>
      );
    });
  })
  .catch(renderPublicSite);
