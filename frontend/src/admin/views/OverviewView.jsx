import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../api.js';
import { useGuardedRequest } from '../useAuth.js';
import { StatCard, StatusBadge, LoadingBlock, ErrorNote, EmptyState, Spinner } from '../components/ui.jsx';

const dateTime = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function TrendIcon({ value }) {
  if (value > 0) return <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />;
  if (value < 0) return <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Minus className="h-3.5 w-3.5" aria-hidden="true" />;
}

/** 14-day lead volume, drawn with plain divs so it stays strictly monochrome. */
function Sparkline({ series }) {
  const max = Math.max(1, ...series.map((d) => d.count));
  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-graphite">Inquiries · last 14 days</h2>
        <span className="font-mono text-[10px] text-graphite">peak {max}</span>
      </div>
      {/* items-stretch (the default) keeps each column full height, so the bars'
          percentage heights have a definite parent to resolve against. */}
      <div className="mt-5 flex h-24 gap-1" role="img" aria-label="Daily inquiry volume for the last 14 days">
        {series.map((day) => (
          <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${day.date}: ${day.count}`}>
            <div
              className="w-full rounded-sm bg-white/70 transition-colors group-hover:bg-white"
              style={{ height: `${Math.max(2, (day.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-graphite">
        <span>{series[0]?.date.slice(5)}</span>
        <span>{series[series.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function OverviewView({ onNavigate, onCounts }) {
  const guarded = useGuardedRequest();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const payload = await guarded(() => api.get('/dashboard/overview'));
      setData(payload);
      onCounts?.(payload.statusCounts);
    } catch (err) {
      setError(err.message || 'Could not load the dashboard.');
    } finally {
      setRefreshing(false);
    }
  }, [guarded, onCounts]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data && !error) return <LoadingBlock label="Loading overview" />;

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-silver">Inbound demand and published work at a glance.</p>
        </div>
        <button type="button" onClick={load} disabled={refreshing} className="btn-invert px-4 py-2 text-xs disabled:opacity-50">
          {refreshing ? <Spinner /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </header>

      <ErrorNote>{error}</ErrorNote>

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total inquiries"
              value={stats.totalLeads}
              meta={`${stats.newLeads} awaiting first response`}
              hint={`${stats.leadsThisWindow} in the last 30 days`}
            />
            <StatCard
              label="Active case studies"
              value={stats.publishedProjects}
              meta={`${stats.totalProjects - stats.publishedProjects} unpublished draft(s)`}
              hint="Live on the public site"
            />
            <StatCard
              label="Conversion rate"
              value={`${stats.conversionRate}%`}
              meta={`${stats.uniqueVisitors} tracked visitor(s)`}
              hint={`${stats.ctaClicks} CTA click(s) recorded`}
            />
            <StatCard
              label="30-day trend"
              value={`${stats.trendPct > 0 ? '+' : ''}${stats.trendPct}%`}
              meta="vs. the previous 30 days"
              hint={
                <span className="inline-flex items-center gap-1.5">
                  <TrendIcon value={stats.trendPct} />
                  {stats.trendPct === 0 ? 'No change' : stats.trendPct > 0 ? 'Growing' : 'Declining'}
                </span>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Sparkline series={data.leadSeries} />
            </div>

            <div className="panel p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-graphite">Pipeline</h2>
              <dl className="mt-4 space-y-3">
                {Object.entries(data.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between gap-3">
                    <dt>
                      <StatusBadge status={status} />
                    </dt>
                    <dd className="font-display text-lg font-bold tabular-nums text-white">{count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="panel lg:col-span-2">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-graphite">Recent submissions</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('leads')}
                  className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 underline underline-offset-4 transition-colors hover:text-white"
                >
                  View all
                </button>
              </div>

              {data.recentLeads.length === 0 ? (
                <EmptyState title="No inquiries yet" hint="Submissions from the site's contact form will appear here." />
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {data.recentLeads.map((lead) => (
                    <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{lead.name}</p>
                        <p className="truncate font-mono text-[11px] text-graphite">
                          {lead.email}
                          {lead.company ? ` · ${lead.company}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={lead.status} />
                        <time className="font-mono text-[10px] text-graphite" dateTime={lead.createdAt}>
                          {dateTime(lead.createdAt)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-graphite">Activity log</h2>
              </div>
              {data.recentTelemetry.length === 0 ? (
                <EmptyState title="No activity" hint="Visitor events appear once the site records traffic." />
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {data.recentTelemetry.map((event) => (
                    <li key={event.id} className="px-5 py-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white">
                        {event.type.replace(/_/g, ' ')}
                      </p>
                      <p className="truncate font-mono text-[10px] text-graphite">
                        {event.label || event.path || '—'} · {dateTime(event.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
