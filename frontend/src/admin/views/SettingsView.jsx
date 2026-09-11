import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, Mail, MonitorSmartphone, ScrollText, LogOut } from 'lucide-react';
import { api } from '../api.js';
import { useAuth, useGuardedRequest } from '../useAuth.js';
import { Field, TextInput, ErrorNote, Spinner, LoadingBlock, EmptyState } from '../components/ui.jsx';

const dateTime = (v) => new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** Trims a User-Agent down to something a human can scan. */
function describeAgent(ua) {
  if (!ua) return 'Unknown device';
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Browser';
  const os =
    /Mac OS X/.test(ua) ? 'macOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : '';
  return os ? `${browser} on ${os}` : browser;
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="panel p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 rounded-lg border border-white/10 p-2 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-silver">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function PasswordSection({ notify }) {
  const guarded = useGuardedRequest();
  const { handleUnauthorized } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (form.newPassword !== form.confirm) {
      setErrors({ confirm: 'The two passwords do not match.' });
      return;
    }

    setBusy(true);
    try {
      await guarded(() =>
        api.post('/auth/change-password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
      );
      notify('Password changed. Sign in again with the new one.');
      // Every session was revoked server-side, including this one.
      setTimeout(handleUnauthorized, 900);
    } catch (err) {
      setError(err.message || 'Could not change the password.');
      setErrors(err.details || {});
      setBusy(false);
    }
  };

  return (
    <Section
      icon={KeyRound}
      title="Change password"
      description="At least 12 characters with upper case, lower case and a number. Changing it signs out every device."
    >
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <ErrorNote>{error}</ErrorNote>
        <Field label="Current password" required error={errors.currentPassword}>
          <TextInput type="password" autoComplete="current-password" required value={form.currentPassword} onChange={set('currentPassword')} />
        </Field>
        <Field label="New password" required error={errors.newPassword}>
          <TextInput type="password" autoComplete="new-password" required value={form.newPassword} onChange={set('newPassword')} />
        </Field>
        <Field label="Confirm new password" required error={errors.confirm}>
          <TextInput type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} />
        </Field>
        <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-xs disabled:opacity-50">
          {busy ? <Spinner /> : 'Update password'}
        </button>
      </form>
    </Section>
  );
}

function EmailSection({ notify }) {
  const guarded = useGuardedRequest();
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ email: '', currentPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      await guarded(() => api.post('/auth/change-email', form));
      await refresh();
      setForm({ email: '', currentPassword: '' });
      notify('Sign-in email updated.');
    } catch (err) {
      setError(err.message || 'Could not change the email address.');
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section icon={Mail} title="Sign-in email" description={`Currently ${user?.email}`}>
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <ErrorNote>{error}</ErrorNote>
        <Field label="New email" required error={errors.email}>
          <TextInput type="email" autoComplete="username" required value={form.email} onChange={set('email')} placeholder="ops@lupusailabs.com" />
        </Field>
        <Field label="Confirm with your password" required error={errors.currentPassword}>
          <TextInput type="password" autoComplete="current-password" required value={form.currentPassword} onChange={set('currentPassword')} />
        </Field>
        <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-xs disabled:opacity-50">
          {busy ? <Spinner /> : 'Update email'}
        </button>
      </form>
    </Section>
  );
}

function SessionsSection({ notify }) {
  const guarded = useGuardedRequest();
  const { handleUnauthorized } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await guarded(() => api.get('/auth/sessions'));
      setSessions(data.sessions);
    } catch (err) {
      setError(err.message || 'Could not load sessions.');
    } finally {
      setLoading(false);
    }
  }, [guarded]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (session) => {
    try {
      const result = await guarded(() => api.delete(`/auth/sessions/${session.id}`));
      if (result.revokedSelf) {
        handleUnauthorized();
        return;
      }
      notify('Session revoked.');
      load();
    } catch (err) {
      setError(err.message || 'Could not revoke the session.');
    }
  };

  const revokeOthers = async () => {
    try {
      const result = await guarded(() => api.post('/auth/sessions/revoke-others'));
      notify(`${result.revoked} other session(s) signed out.`);
      load();
    } catch (err) {
      setError(err.message || 'Could not revoke the other sessions.');
    }
  };

  return (
    <Section icon={MonitorSmartphone} title="Active sessions" description="Every device currently signed in to this account.">
      <ErrorNote>{error}</ErrorNote>
      {loading ? (
        <LoadingBlock label="Loading sessions" />
      ) : (
        <>
          <ul className="divide-y divide-white/[0.06]">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-white">
                    {describeAgent(session.userAgent)}
                    {session.isCurrent && (
                      <span className="ml-2 rounded-full bg-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-black">
                        This device
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-graphite">
                    Started {dateTime(session.createdAt)} · last active {dateTime(session.lastSeenAt)}
                  </p>
                </div>
                <button type="button" onClick={() => revoke(session)} className="btn-invert px-3 py-1.5 text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                  {session.isCurrent ? 'Sign out' : 'Revoke'}
                </button>
              </li>
            ))}
          </ul>
          {sessions.length > 1 && (
            <button type="button" onClick={revokeOthers} className="btn-outline mt-4 px-4 py-2 text-xs">
              Sign out all other devices
            </button>
          )}
        </>
      )}
    </Section>
  );
}

function AuditSection() {
  const guarded = useGuardedRequest();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await guarded(() => api.get('/audit?pageSize=40'));
        setEntries(data.entries);
      } catch (err) {
        setError(err.message || 'Could not load the audit log.');
      } finally {
        setLoading(false);
      }
    })();
  }, [guarded]);

  return (
    <Section icon={ScrollText} title="Access & audit log" description="Sign-ins, failures and every privileged change.">
      <ErrorNote>{error}</ErrorNote>
      {loading ? (
        <LoadingBlock label="Loading audit log" />
      ) : entries.length === 0 ? (
        <EmptyState title="No entries yet" />
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 bg-ink-800">
              <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
                <th scope="col" className="py-2.5 pr-4 font-normal">Action</th>
                <th scope="col" className="py-2.5 pr-4 font-normal">Actor</th>
                <th scope="col" className="py-2.5 pr-4 font-normal">Detail</th>
                <th scope="col" className="py-2.5 font-normal">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2.5 pr-4 font-mono text-[11px] uppercase tracking-wider text-white">
                    {entry.action.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-[11px] text-silver">{entry.actor || 'anonymous'}</td>
                  <td className="max-w-[220px] truncate py-2.5 pr-4 text-[11px] text-graphite" title={entry.detail || ''}>
                    {entry.detail || '—'}
                  </td>
                  <td className="whitespace-nowrap py-2.5 font-mono text-[10px] text-graphite">{dateTime(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

export default function SettingsView({ notify }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Settings & Security</h1>
        <p className="mt-1 text-sm text-silver">Credentials, active devices and the access audit trail.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PasswordSection notify={notify} />
        <EmailSection notify={notify} />
      </div>

      <SessionsSection notify={notify} />
      <AuditSection />
    </div>
  );
}
