import React, { useState, useEffect, useRef } from 'react';

interface EdgeWeightPopoverProps {
  sourceLabel: string;
  targetLabel: string;
  initialWeight?: number;
  submitLabel?: string;
  onSubmit: (weight: number) => void;
  onCancel: () => void;
}

export function EdgeWeightPopover({
  sourceLabel,
  targetLabel,
  initialWeight = 1,
  submitLabel = 'CREATE EDGE',
  onSubmit,
  onCancel
}: EdgeWeightPopoverProps) {
  const [weight, setWeight] = useState(initialWeight.toString());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weight.trim());
    if (isNaN(val) || !isFinite(val)) {
      setError('Please enter a valid numeric edge weight.');
      return;
    }
    onSubmit(val);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edge-popover-title"
    >
      <form
        onSubmit={handleSubmit}
        className="surface-panel p-5 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-xs animate-in fade-in zoom-in-95 duration-200"
      >
        <h3
          id="edge-popover-title"
          className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1"
        >
          {submitLabel === 'SAVE' ? 'Edit Edge Weight' : 'Set Edge Weight'}
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          {submitLabel === 'SAVE'
            ? `Editing edge from node ${sourceLabel} to node ${targetLabel}`
            : `Connecting node ${sourceLabel} to node ${targetLabel}`}
        </p>

        <label htmlFor="edge-weight-input" className="sr-only">
          Edge Weight
        </label>
        <input
          id="edge-weight-input"
          ref={inputRef}
          type="number"
          step="any"
          value={weight}
          onChange={e => {
            setWeight(e.target.value);
            if (error) setError(null);
          }}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          placeholder="e.g. 4.5 or -2"
        />

        {error ? (
          <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mb-3">{error}</p>
        ) : (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4">
            Supports positive and negative numbers. Note that Dijkstra requires non-negative weights (≥ 0).
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
