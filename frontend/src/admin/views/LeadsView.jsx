import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Download, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api.js';
import { useGuardedRequest } from '../useAuth.js';
import {
  StatusBadge,
  LoadingBlock,
  EmptyState,
  ErrorNote,
  Modal,
  Select,
  TextArea,
  Field,
  Spinner,
} from '../components/ui.jsx';

const STATUSES = ['NEW', 'IN_REVIEW', 'CONTACTED', 'ARCHIVED'];
const SYSTEMS = [
  ['', 'All systems'],
  ['CUSTOMER_INTERACTION', 'Customer Interaction'],
  ['OPERATIONS', 'Business Operations'],
  ['PRODUCTS', 'AI Products'],
  ['GENERAL', 'General'],
];

const dateTime = (v) => new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** Debounces a value so typing in the search box does not hammer the API. */
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function LeadDetail({ lead, onClose, onSaved, onDeleted, notify }) {
  const guarded = useGuardedRequest();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = status !== lead.status || notes !== (lead.notes || '');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const { lead: updated } = await guarded(() =>
        api.patch(`/leads/${lead.id}`, { status, notes })
      );
      onSaved(updated);
      notify('Inquiry updated.');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the change.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await guarded(() => api.delete(`/leads/${lead.id}`));
      onDeleted(lead.id);
      notify('Inquiry deleted.');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not delete the inquiry.');
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={lead.name}
      subtitle={`Received ${dateTime(lead.createdAt)}`}
      wide
      footer={
        <>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="btn mr-auto border border-white/15 px-4 py-2 text-xs text-neutral-400 hover:border-white hover:bg-white hover:text-black disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <button type="button" onClick={onClose} className="btn-outline px-5 py-2 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="btn-primary px-5 py-2 text-xs disabled:opacity-40"
          >
            {busy ? <Spinner /> : 'Save changes'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <ErrorNote>{error}</ErrorNote>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">Email</dt>
            <dd className="mt-1 break-all text-sm text-white">
              <a className="underline underline-offset-4 hover:text-neutral-300" href={`mailto:${lead.email}`}>
                {lead.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">Company</dt>
            <dd className="mt-1 text-sm text-white">{lead.company || '—'}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">System of interest</dt>
            <dd className="mt-1 text-sm text-white">{lead.selectedSystem.replace(/_/g, ' ')}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">Source</dt>
            <dd className="mt-1 text-sm text-white">{lead.source || '—'}</dd>
          </div>
        </dl>

        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">Message</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-4 text-sm leading-relaxed text-silver">
            {lead.message}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end pb-1">
            <StatusBadge status={status} />
          </div>
        </div>

        <Field label="Internal notes" hint="Visible to staff only. Never shown on the public site.">
          <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Follow-up notes…" />
        </Field>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this inquiry?"
        subtitle="This cannot be undone"
        footer={
          <>
            <button type="button" onClick={() => setConfirmDelete(false)} className="btn-outline px-5 py-2 text-xs">
              Keep it
            </button>
            <button type="button" onClick={remove} disabled={busy} className="btn-primary px-5 py-2 text-xs disabled:opacity-50">
              {busy ? <Spinner /> : 'Delete permanently'}
            </button>
          </>
        }
      >
        <p className="text-sm text-silver">
          {lead.name} ({lead.email}) will be removed from the database permanently. Export first if you need a record.
        </p>
      </Modal>
    </Modal>
  );
}

export default function LeadsView({ onCounts, notify }) {
  const guarded = useGuardedRequest();
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', system: '', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const search = useDebounced(searchInput);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.system) params.set('system', filters.system);
    if (search) params.set('search', search);
    if (filters.sort) params.set('sort', filters.sort);
    return params.toString();
  }, [filters, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(queryString);
      params.set('page', String(page));
      const data = await guarded(() => api.get(`/leads?${params.toString()}`));
      setLeads(data.leads);
      setPagination(data.pagination);
      setCounts(data.counts);
      onCounts?.(data.counts);
    } catch (err) {
      setError(err.message || 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  }, [guarded, queryString, page, onCounts]);

  useEffect(() => {
    load();
  }, [load]);

  // Any filter change returns to the first page.
  useEffect(() => {
    setPage(1);
  }, [queryString]);

  const onExport = async () => {
    setExporting(true);
    try {
      await api.downloadLeadsCsv(queryString ? `?${queryString}` : '');
      notify('Export downloaded.');
    } catch {
      setError('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const applyUpdate = (updated) => setLeads((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
  const applyDelete = (id) => {
    setLeads((rows) => rows.filter((r) => r.id !== id));
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Inquiries</h1>
          <p className="mt-1 text-sm text-silver">
            {pagination.total} total · {counts.NEW || 0} awaiting a first response
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn-invert px-4 py-2 text-xs disabled:opacity-50">
            {loading ? <Spinner /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || leads.length === 0}
            className="btn-primary px-4 py-2 text-xs disabled:opacity-40"
          >
            {exporting ? <Spinner /> : <Download className="h-3.5 w-3.5" />}
            Export CSV
          </button>
        </div>
      </header>

      <ErrorNote>{error}</ErrorNote>

      {/* Filters */}
      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, company or message…"
            aria-label="Search inquiries"
            className="field pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          aria-label="Filter by status"
          className="w-auto min-w-[150px]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')} ({counts[s] || 0})
            </option>
          ))}
        </Select>

        <Select
          value={filters.system}
          onChange={(e) => setFilters((f) => ({ ...f, system: e.target.value }))}
          aria-label="Filter by system"
          className="w-auto min-w-[170px]"
        >
          {SYSTEMS.map(([value, label]) => (
            <option key={value || 'all'} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          aria-label="Sort order"
          className="w-auto min-w-[130px]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {loading && leads.length === 0 ? (
          <LoadingBlock label="Loading inquiries" />
        ) : leads.length === 0 ? (
          <EmptyState
            title="Nothing matches"
            hint={search || filters.status || filters.system ? 'Try clearing the filters.' : 'New submissions will appear here.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
                  <th scope="col" className="px-5 py-3 font-normal">Contact</th>
                  <th scope="col" className="px-5 py-3 font-normal">System</th>
                  <th scope="col" className="px-5 py-3 font-normal">Received</th>
                  <th scope="col" className="px-5 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(lead);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-white/[0.04] focus:bg-white/[0.06] focus:outline-none"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="font-mono text-[11px] text-graphite">
                        {lead.email}
                        {lead.company ? ` · ${lead.company}` : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-wider text-silver">
                      {lead.selectedSystem.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-graphite">{dateTime(lead.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <span className="font-mono text-[11px] text-graphite">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-invert px-3 py-1.5 text-xs disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-invert px-3 py-1.5 text-xs disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onSaved={applyUpdate}
          onDeleted={applyDelete}
          notify={notify}
        />
      )}
    </div>
  );
}
