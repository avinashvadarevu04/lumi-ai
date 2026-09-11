import React, { useState } from 'react';
import { LayoutDashboard, Inbox, FolderKanban, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './useAuth.js';
import { adminUrl } from './config.js';
import { LupusMark } from '@/components/BrandLogo';

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'leads', label: 'Inquiries', icon: Inbox },
  { key: 'projects', label: 'Case Studies', icon: FolderKanban },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminShell({ view, onNavigate, badge, children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (key) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    onNavigate(key);
  };

  const navItems = NAV.map((item) => {
    const Icon = item.icon;
    const active = view === item.key;
    return (
      <a
        key={item.key}
        href={adminUrl(item.key)}
        onClick={go(item.key)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
          active ? 'bg-white font-semibold text-black' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {item.label}
        </span>
        {item.key === 'leads' && badge > 0 && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums',
              active ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            {badge}
          </span>
        )}
      </a>
    );
  });

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-ink-900 p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <LupusMark className="h-7 w-7 text-white" />
          <div className="leading-none">
            <div className="font-display text-sm font-bold uppercase tracking-[0.22em] text-white">Lupus</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-graphite">Ops Gateway</div>
          </div>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">{navItems}</nav>

        <div className="border-t border-white/10 pt-4">
          <div className="truncate px-3 text-xs text-silver" title={user?.email}>
            {user?.email}
          </div>
          <div className="mt-0.5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
            {user?.role?.replace(/_/g, ' ')}
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white hover:text-black"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-ink-900 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <LupusMark className="h-6 w-6 text-white" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-graphite">Ops Gateway</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-neutral-300 transition-colors hover:bg-white hover:text-black"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-b border-white/10 bg-ink-900 p-3 lg:hidden">
            {navItems}
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-neutral-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        )}

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
