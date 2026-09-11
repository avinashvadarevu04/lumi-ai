import React, { useCallback, useEffect, useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2, Star, RefreshCw } from 'lucide-react';
import { api } from '../api.js';
import { useGuardedRequest } from '../useAuth.js';
import {
  LoadingBlock,
  EmptyState,
  ErrorNote,
  Modal,
  Field,
  TextInput,
  TextArea,
  Toggle,
  Spinner,
} from '../components/ui.jsx';

const BLANK = {
  title: '',
  slug: '',
  category: '',
  headline: '',
  description: '',
  solution: '',
  workflowSummary: '',
  metrics: '',
  technologies: '',
  highlights: '',
  isFeatured: false,
  isPublished: true,
};

const toForm = (project) => ({
  ...BLANK,
  ...project,
  slug: project.slug || '',
  headline: project.headline || '',
  solution: project.solution || '',
  workflowSummary: project.workflowSummary || '',
  metrics: project.metrics || '',
  technologies: (project.technologies || []).join(', '),
  highlights: (project.highlights || []).join('\n'),
});

const splitList = (value, separator) =>
  String(value || '')
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

function ProjectForm({ project, onClose, onSaved, notify }) {
  const guarded = useGuardedRequest();
  const isEdit = Boolean(project?.id);
  const [form, setForm] = useState(project ? toForm(project) : BLANK);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});

    const payload = {
      title: form.title,
      category: form.category,
      headline: form.headline,
      description: form.description,
      solution: form.solution,
      workflowSummary: form.workflowSummary,
      metrics: form.metrics,
      technologies: splitList(form.technologies, ','),
      highlights: splitList(form.highlights, '\n'),
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    try {
      const result = isEdit
        ? await guarded(() => api.patch(`/projects/${project.id}`, payload))
        : await guarded(() => api.post('/projects', payload));
      onSaved(result.project, isEdit);
      notify(isEdit ? 'Case study updated.' : 'Case study created.');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the case study.');
      setErrors(err.details || {});
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={isEdit ? 'Edit case study' : 'New case study'}
      subtitle={isEdit ? project.slug : 'Published straight to the public site'}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline px-5 py-2 text-xs">
            Cancel
          </button>
          <button type="submit" form="project-form" disabled={busy} className="btn-primary px-5 py-2 text-xs disabled:opacity-50">
            {busy ? <Spinner /> : isEdit ? 'Save changes' : 'Create case study'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} className="space-y-4" noValidate>
        <ErrorNote>{error}</ErrorNote>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" required error={errors.title}>
            <TextInput value={form.title} onChange={set('title')} required invalid={Boolean(errors.title)} placeholder="GetMyHotels" />
          </Field>
          <Field label="Category" required error={errors.category}>
            <TextInput
              value={form.category}
              onChange={set('category')}
              required
              invalid={Boolean(errors.category)}
              placeholder="Travel / Hospitality Technology"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Headline" error={errors.headline}>
            <TextInput value={form.headline} onChange={set('headline')} placeholder="AI Travel & Booking Platform" />
          </Field>
          <Field label="Slug" error={errors.slug} hint={isEdit ? undefined : 'Left blank, this is generated from the title.'}>
            <TextInput value={form.slug} onChange={set('slug')} placeholder="getmyhotels" invalid={Boolean(errors.slug)} />
          </Field>
        </div>

        <Field label="Problem / description" required error={errors.description}>
          <TextArea
            rows={4}
            value={form.description}
            onChange={set('description')}
            required
            invalid={Boolean(errors.description)}
            placeholder="The business problem this system solved…"
          />
        </Field>

        <Field label="Solution" error={errors.solution}>
          <TextArea rows={4} value={form.solution} onChange={set('solution')} placeholder="What Lumi AI engineered…" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Workflow summary" error={errors.workflowSummary}>
            <TextInput value={form.workflowSummary} onChange={set('workflowSummary')} placeholder="Search → Select → Booking" />
          </Field>
          <Field label="Metrics / impact" error={errors.metrics}>
            <TextInput value={form.metrics} onChange={set('metrics')} placeholder="15x pipeline improvement" />
          </Field>
        </div>

        <Field label="Technologies" hint="Comma separated." error={errors.technologies}>
          <TextInput value={form.technologies} onChange={set('technologies')} placeholder="React.js, Python FastAPI, PostgreSQL" />
        </Field>

        <Field label="Architectural highlights" hint="One per line." error={errors.highlights}>
          <TextArea rows={4} value={form.highlights} onChange={set('highlights')} placeholder={'First highlight\nSecond highlight'} />
        </Field>

        <div className="flex flex-wrap gap-6 border-t border-white/10 pt-4">
          <Toggle checked={form.isPublished} onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} label="Published on the public site" />
          <Toggle checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} label="Featured" />
        </div>
      </form>
    </Modal>
  );
}

export default function ProjectsView({ notify }) {
  const guarded = useGuardedRequest();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // project | 'new' | null
  const [confirming, setConfirming] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await guarded(() => api.get('/projects'));
      setProjects(data.projects);
    } catch (err) {
      setError(err.message || 'Could not load case studies.');
    } finally {
      setLoading(false);
    }
  }, [guarded]);

  useEffect(() => {
    load();
  }, [load]);

  const persistOrder = async (ordered) => {
    const previous = projects;
    setProjects(ordered); // optimistic
    setSavingOrder(true);
    try {
      const data = await guarded(() => api.post('/projects/reorder', { order: ordered.map((p) => p.id) }));
      setProjects(data.projects);
    } catch (err) {
      setProjects(previous); // roll back on failure
      setError(err.message || 'Could not save the new order.');
    } finally {
      setSavingOrder(false);
    }
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const remove = async (project) => {
    try {
      await guarded(() => api.delete(`/projects/${project.id}`));
      setProjects((rows) => rows.filter((p) => p.id !== project.id));
      notify('Case study deleted.');
    } catch (err) {
      setError(err.message || 'Could not delete the case study.');
    } finally {
      setConfirming(null);
    }
  };

  const onSaved = (project, isEdit) => {
    setProjects((rows) => (isEdit ? rows.map((p) => (p.id === project.id ? project : p)) : [...rows, project]));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Case Studies</h1>
          <p className="mt-1 text-sm text-silver">
            Edit the work shown on the homepage. Changes go live immediately, with no deploy.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn-invert px-4 py-2 text-xs disabled:opacity-50">
            {loading ? <Spinner /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
          <button type="button" onClick={() => setEditing('new')} className="btn-primary px-4 py-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New case study
          </button>
        </div>
      </header>

      <ErrorNote>{error}</ErrorNote>

      <div className="panel overflow-hidden">
        {loading && projects.length === 0 ? (
          <LoadingBlock label="Loading case studies" />
        ) : projects.length === 0 ? (
          <EmptyState title="No case studies yet" hint="Create one to populate the Selected Work section." />
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {projects.map((project, index) => (
              <li key={project.id} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || savingOrder}
                    aria-label={`Move ${project.title} up`}
                    className="cursor-pointer rounded border border-white/10 p-1 text-neutral-400 transition-colors hover:bg-white hover:text-black disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === projects.length - 1 || savingOrder}
                    aria-label={`Move ${project.title} down`}
                    className="cursor-pointer rounded border border-white/10 p-1 text-neutral-400 transition-colors hover:bg-white hover:text-black disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                <span className="font-mono text-lg font-bold tabular-nums text-neutral-700">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">{project.title}</h2>
                    {project.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-black">
                        <Star className="h-2.5 w-2.5" />
                        Featured
                      </span>
                    )}
                    {!project.isPublished && (
                      <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="truncate font-mono text-[11px] text-graphite">
                    {project.category} · /{project.slug}
                  </p>
                  {project.technologies.length > 0 && (
                    <p className="mt-1 truncate text-[11px] text-neutral-500">{project.technologies.join(' · ')}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(project)}
                    aria-label={`Edit ${project.title}`}
                    className="btn-invert px-3 py-1.5 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(project)}
                    aria-label={`Delete ${project.title}`}
                    className="btn border border-white/10 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-white hover:bg-white hover:text-black"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ProjectForm
          project={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          notify={notify}
        />
      )}

      <Modal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        title="Delete this case study?"
        subtitle="This cannot be undone"
        footer={
          <>
            <button type="button" onClick={() => setConfirming(null)} className="btn-outline px-5 py-2 text-xs">
              Keep it
            </button>
            <button type="button" onClick={() => remove(confirming)} className="btn-primary px-5 py-2 text-xs">
              Delete permanently
            </button>
          </>
        }
      >
        <p className="text-sm text-silver">
          &ldquo;{confirming?.title}&rdquo; will be removed from the database and disappear from the public site immediately.
        </p>
      </Modal>
    </div>
  );
}
