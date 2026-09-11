import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from './useAuth.js';
import { ApiError } from './api.js';
import { Field, TextInput, ErrorNote, Spinner } from './components/ui.jsx';
import { LupusMark } from '@/components/BrandLogo';

/**
 * Sign-in screen for the operations gateway. It reveals nothing about whether
 * an email exists: the server returns one message for every failure mode.
 */
export default function LoginView() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setFieldErrors({});
    try {
      await login(form.email, form.password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details || {});
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LupusMark className="h-12 w-12 text-white" />
          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-[0.2em] text-white">
            Operations
          </h1>
          <p className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-graphite">
            <ShieldCheck className="h-3 w-3" />
            Restricted access
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel space-y-4 p-6" noValidate>
          <ErrorNote>{error}</ErrorNote>

          <Field label="Email" required error={fieldErrors.email}>
            <TextInput
              type="email"
              name="email"
              autoComplete="username"
              required
              autoFocus
              value={form.email}
              onChange={set('email')}
              invalid={Boolean(fieldErrors.email)}
              placeholder="you@company.com"
            />
          </Field>

          <Field label="Password" required error={fieldErrors.password}>
            <TextInput
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={set('password')}
              invalid={Boolean(fieldErrors.password)}
              placeholder="••••••••••••"
            />
          </Field>

          <button type="submit" disabled={busy} className="btn-primary group w-full py-3 text-sm disabled:opacity-60">
            {busy ? <Spinner /> : <span>Sign in</span>}
            {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>

          <p className="pt-1 text-center font-mono text-[10px] leading-relaxed tracking-wider text-graphite">
            Sessions expire automatically. Repeated failed attempts lock the account.
          </p>
        </form>
      </div>
    </main>
  );
}
