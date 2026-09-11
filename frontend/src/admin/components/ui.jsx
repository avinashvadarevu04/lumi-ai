import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Status badge — monochrome only, differentiated by weight and form  */
/* ------------------------------------------------------------------ */

const BADGE_STYLES = {
  NEW: 'bg-white text-black border-white font-semibold',
  IN_REVIEW: 'border-white/60 text-white',
  CONTACTED: 'border-white/25 text-neutral-400',
  ARCHIVED: 'border-white/10 text-neutral-600 line-through',
};

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]',
        BADGE_STYLES[status] || 'border-white/20 text-neutral-400',
        className
      )}
    >
      {String(status || '').replace(/_/g, ' ')}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function StatCard({ label, value, meta, hint }) {
  return (
    <div className="panel flex flex-col justify-between p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-graphite">{label}</div>
      <div className="mt-4 font-display text-4xl font-bold tracking-tight text-white tabular-nums">{value}</div>
      {meta && <div className="mt-1 text-xs text-silver">{meta}</div>}
      {hint && <div className="mt-3 border-t border-white/10 pt-3 font-mono text-[10px] text-graphite">{hint}</div>}
    </div>
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}

export function LoadingBlock({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 font-mono text-xs uppercase tracking-[0.2em] text-graphite">
      <Spinner />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {hint && <p className="max-w-sm text-sm text-silver">{hint}</p>}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-xl border border-white/30 bg-white/[0.04] px-4 py-3 text-sm text-white">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form primitives                                                    */
/* ------------------------------------------------------------------ */

export function Field({ label, error, hint, children, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
        {label}
        {required && <span aria-hidden="true">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-graphite">{hint}</span>}
      {error && (
        <span className="mt-1 block text-[11px] text-white" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export function TextInput({ invalid, className, ...props }) {
  return <input {...props} className={cn('field', invalid && 'border-white/70', className)} />;
}

export function TextArea({ invalid, className, ...props }) {
  return <textarea {...props} className={cn('field resize-y', invalid && 'border-white/70', className)} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select {...props} className={cn('field appearance-none', className)}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex cursor-pointer items-center gap-3"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full border transition-colors',
          checked ? 'border-white bg-white' : 'border-white/25 bg-transparent'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all',
            checked ? 'left-[18px] bg-black' : 'left-[3px] bg-white/60'
          )}
        />
      </span>
      <span className="text-sm text-silver">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn('panel relative flex max-h-[88vh] w-full flex-col overflow-hidden', wide ? 'max-w-3xl' : 'max-w-xl')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="font-display text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-graphite">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-white/10 p-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

export function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/20 bg-white px-5 py-2.5 text-sm font-medium text-black shadow-card"
    >
      {message}
    </div>
  );
}
