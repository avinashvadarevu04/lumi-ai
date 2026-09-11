import React, { useCallback, useEffect, useState } from 'react';
import AuthProvider from './AuthProvider.jsx';
import { useAuth } from './useAuth.js';
import { adminUrl, viewFromPath } from './config.js';
import AdminShell from './AdminShell.jsx';
import LoginView from './LoginView.jsx';
import OverviewView from './views/OverviewView.jsx';
import LeadsView from './views/LeadsView.jsx';
import ProjectsView from './views/ProjectsView.jsx';
import SettingsView from './views/SettingsView.jsx';
import { LoadingBlock, Toast } from './components/ui.jsx';

const VIEWS = {
  overview: OverviewView,
  leads: LeadsView,
  projects: ProjectsView,
  settings: SettingsView,
};

function Dashboard() {
  const [view, setView] = useState(() => viewFromPath());
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [toast, setToast] = useState('');

  // Keep the address bar and the back button in step with the active view.
  useEffect(() => {
    const onPop = () => setView(viewFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next) => {
    const target = VIEWS[next] ? next : 'overview';
    window.history.pushState({}, '', adminUrl(target === 'overview' ? '' : target));
    setView(target);
  }, []);

  const onCounts = useCallback((counts) => setNewLeadCount(counts?.NEW || 0), []);
  const notify = useCallback((message) => setToast(message), []);

  const Active = VIEWS[view] || OverviewView;

  return (
    <AdminShell view={VIEWS[view] ? view : 'overview'} onNavigate={navigate} badge={newLeadCount}>
      <Active onNavigate={navigate} onCounts={onCounts} notify={notify} />
      <Toast message={toast} onDismiss={() => setToast('')} />
    </AdminShell>
  );
}

/**
 * Gate: nothing but the login form renders until `/auth/me` confirms a valid,
 * unrevoked session, so no protected markup or data reaches an anonymous
 * visitor who guesses the URL.
 */
function Gate() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingBlock label="Verifying session" />
      </div>
    );
  }

  return status === 'authenticated' ? <Dashboard /> : <LoginView />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
