import React, { useState, useEffect, useRef } from 'react';

interface EdgeWeightPopoverProps {
  sourceLabel: string;
  targetLabel: string;
  initialWeight?: number;
  submitLabel?: string;
  onSubmit: (weight: number) => void;
  onCancel: () => void;
}

export function EdgeWeightPopover({ sourceLabel, targetLabel, initialWeight = 1, submitLabel = "CREATE EDGE", onSubmit, onCancel }: EdgeWeightPopoverProps) {
  const [weight, setWeight] = useState(initialWeight.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weight);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid positive number');
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
    <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-100/10 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-5 rounded shadow-xl border border-zinc-200 dark:border-zinc-800 w-72 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1">{submitLabel === "SAVE" ? "Edit Edge Weight" : "Set Edge Weight"}</h3>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4">{submitLabel === "SAVE" ? `Editing edge from Node ${sourceLabel} to Node ${targetLabel}` : `Connecting Node ${sourceLabel} to Node ${targetLabel}`}</p>
        
        <input
          ref={inputRef}
          type="number"
          step="any"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-sm font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 mb-4"
          placeholder="e.g. 4.5"
        />
        
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 rounded">CANCEL</button>
          <button type="submit" className="px-3 py-1.5 text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 shadow-sm">{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
