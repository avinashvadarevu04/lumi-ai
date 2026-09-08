import React, { useEffect, useState } from 'react';
import { X, Send, CheckCircle2, Terminal } from 'lucide-react';

const INITIAL = { name: '', email: '', company: '', industry: 'Healthcare', problem: '' };

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(INITIAL);
    onClose();
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Talk to Lumi AI"
    >
      <div className="panel relative w-full max-w-xl overflow-hidden p-6 shadow-card sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-2 text-neutral-400 transition-colors hover:bg-white hover:text-black"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="mb-6">
              <div className="eyebrow mb-3">
                <Terminal className="h-3 w-3" />
                <span>Direct founder discovery</span>
              </div>
              <h3 className="mb-2 font-display text-2xl font-bold text-white sm:text-3xl">Talk to Lumi AI</h3>
              <p className="text-xs leading-relaxed text-silver sm:text-sm">
                Tell us what you're trying to automate or improve. We'll diagnose the operational workflow and tell you
                what should actually be built.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-[0.15em] text-neutral-400">YOUR NAME *</span>
                  <input type="text" required placeholder="e.g. Alex Morgan" value={form.name} onChange={set('name')} className="field" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-[0.15em] text-neutral-400">WORK EMAIL *</span>
                  <input type="email" required placeholder="alex@company.com" value={form.email} onChange={set('email')} className="field" />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-[0.15em] text-neutral-400">ORGANIZATION</span>
                  <input type="text" placeholder="Company or practice name" value={form.company} onChange={set('company')} className="field" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-[0.15em] text-neutral-400">PRIMARY INDUSTRY</span>
                  <select value={form.industry} onChange={set('industry')} className="field appearance-none">
                    <option value="Healthcare">Healthcare / Clinics</option>
                    <option value="Professional Services">Legal / Accounting / Advisory</option>
                    <option value="Logistics">Logistics & Freight</option>
                    <option value="Commerce">Commerce & D2C</option>
                    <option value="Travel">Travel & Hospitality</option>
                    <option value="Education">Education & Coaching</option>
                    <option value="Custom Platform">Other Custom System</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-[0.15em] text-neutral-400">
                  OPERATIONAL BOTTLENECK / OBJECTIVE
                </span>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the workflow, documents, or customer interactions you want to automate..."
                  value={form.problem}
                  onChange={set('problem')}
                  className="field resize-none"
                />
              </label>

              <div className="pt-2">
                <button type="submit" className="btn-primary group w-full px-6 py-3.5 text-sm">
                  <span>Submit inquiry</span>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="text-center font-mono text-[11px] text-graphite">
                Lumi AI will reply within 24 hours with an initial architectural thesis.
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-black">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-bold text-white">Inquiry received</h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-silver">
              Thank you, {form.name || 'there'}. Our engineering team has logged your operational context. We will reach
              out via <span className="font-semibold text-white">{form.email}</span> shortly.
            </p>
            <button type="button" onClick={handleReset} className="btn-primary px-6 py-2.5 text-xs">
              Return to site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
