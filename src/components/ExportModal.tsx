import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, Code, Printer, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Node, Edge, AlgorithmResult } from '../types';
import { algorithmMetadata } from '../algorithms/metadata';

export interface ExportResultData {
  shortestPath?: string[] | null;
  path?: string[] | null;
  totalCost?: number;
  cost?: number;
  nodesVisited?: number;
  edgesExplored?: number;
  steps?: any[];
  error?: string;
  negativeCycle?: boolean;
}

function getExecutionPath(res?: ExportResultData | AlgorithmResult | null): string[] {
  if (!res) return [];
  const anyRes = res as any;
  if (Array.isArray(anyRes.shortestPath)) return anyRes.shortestPath;
  if (Array.isArray(anyRes.path)) return anyRes.path;
  return [];
}

function getExecutionCost(res?: ExportResultData | AlgorithmResult | null): number | undefined {
  if (!res) return undefined;
  const anyRes = res as any;
  if (anyRes.totalCost !== undefined) return anyRes.totalCost;
  if (anyRes.cost !== undefined) return anyRes.cost;
  return undefined;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  currentAlgorithm: string;
  executionResult?: ExportResultData | AlgorithmResult | null;
  sourceNodeId?: string | null;
  destNodeId?: string | null;
  theme?: 'light' | 'dark';
}

export function ExportModal({
  isOpen,
  onClose,
  nodes,
  edges,
  currentAlgorithm,
  executionResult,
  sourceNodeId,
  destNodeId,
  theme = 'light'
}: ExportModalProps) {
  const [exportType, setExportType] = useState<'PNG' | 'SVG' | 'JSON' | 'REPORT'>('PNG');
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute graph bounds to prevent cropping
  const computeBounds = () => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, width: 800, height: 600, maxX: 800, maxY: 600 };
    }
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padding = 80;
    const headerHeight = includeStats ? 90 : 40;
    const footerHeight = 40;

    return {
      minX: minX - padding,
      minY: minY - padding - headerHeight,
      maxX: maxX + padding,
      maxY: maxY + padding + footerHeight,
      width: Math.max(650, maxX - minX + padding * 2),
      height: Math.max(450, maxY - minY + padding * 2 + headerHeight + footerHeight)
    };
  };

  const generateSvgString = () => {
    const bounds = computeBounds();
    const isDark = theme === 'dark';
    const bgFill = isDark ? '#09090b' : '#fafafa';
    const panelBg = isDark ? 'rgba(24, 24, 27, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    const textPrimary = isDark ? '#f4f4f5' : '#18181b';
    const textMuted = isDark ? '#a1a1aa' : '#71717a';
    const edgeDefault = isDark ? '#52525b' : '#cbd5e1';
    const edgePath = isDark ? '#818cf8' : '#4f46e5';
    const nodeDefaultFill = isDark ? '#18181b' : '#ffffff';
    const nodeDefaultStroke = isDark ? '#52525b' : '#94a3b8';
    const nodePathFill = isDark ? '#0c4a6e' : '#e0f2fe';
    const nodePathStroke = isDark ? '#38bdf8' : '#0284c7';
    const nodeSourceFill = isDark ? '#14532d' : '#dcfce7';
    const nodeSourceStroke = isDark ? '#22c55e' : '#16a34a';
    const nodeDestFill = isDark ? '#881337' : '#ffe4e6';
    const nodeDestStroke = isDark ? '#fb7185' : '#f43f5e';

    const pathNodes = getExecutionPath(executionResult);
    const pathEdges = new Set<string>();

    if (pathNodes.length > 1) {
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const u = pathNodes[i];
        const v = pathNodes[i + 1];
        const match = edges.find(e => (e.source === u && e.target === v) || (!e.directed && e.source === v && e.target === u));
        if (match) pathEdges.add(match.id);
      }
    }

    let edgesSvg = '';
    edges.forEach(e => {
      const s = nodes.find(n => n.id === e.source);
      const t = nodes.find(n => n.id === e.target);
      if (!s || !t) return;
      const isPath = pathEdges.has(e.id);
      const stroke = isPath ? edgePath : edgeDefault;
      const strokeWidth = isPath ? 3.5 : 2;

      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return;
      const ratio = Math.max(0, (length - 22) / length);
      const endX = s.x + dx * ratio;
      const endY = s.y + dy * ratio;

      const marker = e.directed ? (isPath ? 'url(#arrow-path-export)' : 'url(#arrow-default-export)') : '';
      edgesSvg += `<path d="M${s.x},${s.y} L${endX},${endY}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" ${marker ? `marker-end="${marker}"` : ''} />`;

      const midX = (s.x + t.x) / 2;
      const midY = (s.y + t.y) / 2;
      edgesSvg += `
        <rect x="${midX - 12}" y="${midY - 8}" width="24" height="16" rx="3" fill="${panelBg}" stroke="${isDark ? '#3f3f46' : '#e2e8f0'}" stroke-width="1" />
        <text x="${midX}" y="${midY + 3.5}" text-anchor="middle" font-family="monospace" font-size="10px" font-weight="600" fill="${textMuted}">${e.weight}</text>
      `;
    });

    let nodesSvg = '';
    nodes.forEach(n => {
      const isSource = n.id === sourceNodeId;
      const isDest = n.id === destNodeId;
      const isPath = pathNodes.includes(n.id);

      let fill = nodeDefaultFill;
      let stroke = nodeDefaultStroke;
      let strokeWidth = 2;

      if (isPath) {
        fill = nodePathFill;
        stroke = nodePathStroke;
        strokeWidth = 3;
      } else if (isSource) {
        fill = nodeSourceFill;
        stroke = nodeSourceStroke;
        strokeWidth = 3;
      } else if (isDest) {
        fill = nodeDestFill;
        stroke = nodeDestStroke;
        strokeWidth = 3;
      }

      nodesSvg += `
        <g transform="translate(${n.x}, ${n.y})">
          <circle r="18" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          <text text-anchor="middle" y="4.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11px" font-weight="700" fill="${textPrimary}">${n.label}</text>
        </g>
      `;
    });

    const algoName = algorithmMetadata[currentAlgorithm]?.name || currentAlgorithm;
    const pathText = pathNodes.length > 0 ? pathNodes.map(id => nodes.find(n => n.id === id)?.label || id).join(' → ') : 'None';
    const costVal = getExecutionCost(executionResult);
    const costText = costVal !== undefined && costVal !== Infinity ? costVal.toString() : 'N/A';

    const headerSvg = includeStats ? `
      <g transform="translate(${bounds.minX + 30}, ${bounds.minY + 30})">
        <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14px" font-weight="800" letter-spacing="0.5px" fill="${textPrimary}">PATHFINDER | Shortest Path Laboratory</text>
        <text y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11px" fill="${textMuted}">Algorithm: ${algoName} | Nodes: ${nodes.length} | Edges: ${edges.length} | Generated: ${new Date().toLocaleDateString()}</text>
        ${executionResult ? `<text y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11px" font-weight="600" fill="${isDark ? '#38bdf8' : '#0284c7'}">Result Path: ${pathText} (Cost: ${costText})</text>` : ''}
      </g>
    ` : '';

    const footerSvg = `
      <g transform="translate(${bounds.maxX - 160}, ${bounds.maxY - 15})">
        <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9px" font-weight="500" fill="${textMuted}">PATHFINDER DSA Engine</text>
      </g>
    `;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">
  <defs>
    <marker id="arrow-default-export" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="${edgeDefault}" />
    </marker>
    <marker id="arrow-path-export" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="${edgePath}" />
    </marker>
  </defs>
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${bgFill}" />
  ${headerSvg}
  <g class="edges">${edgesSvg}</g>
  <g class="nodes">${nodesSvg}</g>
  ${footerSvg}
</svg>`.trim();
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    setStatusMessage('Rasterizing high-resolution canvas...');
    setErrorMessage(null);

    try {
      const svgString = generateSvgString();
      const bounds = computeBounds();
      const scale = 2; // High-DPI retina rendering
      const width = bounds.width * scale;
      const height = bounds.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas 2D context.');

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to render vector graph to image.'));
        };
        img.src = url;
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setErrorMessage('Failed to generate PNG blob.');
          setIsExporting(false);
          return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `pathfinder-graph-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        setStatusMessage('PNG downloaded successfully!');
        setTimeout(() => {
          setIsExporting(false);
          setStatusMessage(null);
        }, 2000);
      }, 'image/png');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error exporting PNG.');
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    try {
      const svgString = generateSvgString();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pathfinder-graph-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
      setStatusMessage('Vector SVG downloaded!');
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error exporting SVG.');
    }
  };

  const handleDownloadJson = () => {
    try {
      const data = {
        meta: {
          app: 'PATHFINDER',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          algorithm: currentAlgorithm
        },
        graph: {
          nodes,
          edges
        },
        execution: executionResult ? {
          shortestPath: getExecutionPath(executionResult),
          totalCost: getExecutionCost(executionResult),
          nodesVisited: ('nodesVisited' in executionResult ? (executionResult as any).nodesVisited : undefined),
          edgesExplored: ('edgesExplored' in executionResult ? (executionResult as any).edgesExplored : undefined)
        } : null
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pathfinder-graph-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setStatusMessage('Graph JSON exported!');
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error exporting JSON.');
    }
  };

  const handlePrintReport = () => {
    const algoName = algorithmMetadata[currentAlgorithm]?.name || currentAlgorithm;
    const pathNodes = getExecutionPath(executionResult);
    const pathText = pathNodes.length > 0 ? pathNodes.map(id => nodes.find(n => n.id === id)?.label || id).join(' → ') : 'None';
    const costVal = getExecutionCost(executionResult);
    const costText = costVal !== undefined && costVal !== Infinity ? costVal.toString() : 'N/A';
    const svgContent = generateSvgString();

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      setErrorMessage('Pop-up blocked. Please allow pop-ups to print the DSA lab report.');
      return;
    }

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PATHFINDER DSA Lab Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #18181b; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #71717a; margin-bottom: 24px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px; margin-bottom: 12px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .stat-card { background: #f4f4f5; padding: 12px; border-radius: 6px; }
            .stat-val { font-size: 18px; font-weight: 700; }
            .stat-lbl { font-size: 11px; color: #71717a; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e4e4e7; padding: 8px 12px; text-align: left; }
            th { background: #f4f4f5; font-weight: 600; }
            .graph-preview { text-align: center; margin: 20px 0; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; }
            .graph-preview svg { max-width: 100%; height: auto; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>PATHFINDER — Graph & Algorithm Lab Report</h1>
              <div class="subtitle">Generated on ${new Date().toLocaleString()} | Algorithm: ${algoName}</div>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #18181b; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print Report</button>
          </div>

          <div class="section">
            <div class="section-title">Execution Summary</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-lbl">Algorithm</div>
                <div class="stat-val">${algoName}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Shortest Path Cost</div>
                <div class="stat-val">${costText}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Nodes Visited</div>
                <div class="stat-val">${executionResult?.nodesVisited ?? 0} / ${nodes.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Edges Explored</div>
                <div class="stat-val">${executionResult?.edgesExplored ?? 0} / ${edges.length}</div>
              </div>
            </div>
            <p><strong>Path Traversed:</strong> ${pathText}</p>
          </div>

          <div class="section">
            <div class="section-title">Graph Topology Visual</div>
            <div class="graph-preview">
              ${svgContent}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Nodes & Edges Registry</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h4 style="margin: 0 0 8px 0; font-size: 12px;">Vertices (${nodes.length})</h4>
                <table>
                  <thead><tr><th>ID</th><th>Label</th><th>Coordinates (X, Y)</th></tr></thead>
                  <tbody>
                    ${nodes.map(n => `<tr><td>${n.id}</td><td><strong>${n.label}</strong></td><td>(${n.x}, ${n.y})</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 style="margin: 0 0 8px 0; font-size: 12px;">Edges (${edges.length})</h4>
                <table>
                  <thead><tr><th>Source</th><th>Target</th><th>Weight</th><th>Directed</th></tr></thead>
                  <tbody>
                    ${edges.map(e => {
                      const s = nodes.find(n => n.id === e.source)?.label || e.source;
                      const t = nodes.find(n => n.id === e.target)?.label || e.target;
                      return `<tr><td>${s}</td><td>${t}</td><td><strong>${e.weight}</strong></td><td>${e.directed ? 'Yes' : 'No'}</td></tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="surface-panel rounded-xl shadow-2xl w-full max-w-lg border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Export Graph & Results
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                High-quality visual graphics, vector diagrams, and lab reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Format selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setExportType('PNG')}
              className={`p-3 rounded-lg border flex flex-col items-center text-center gap-1.5 transition-all ${
                exportType === 'PNG'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">PNG Image</span>
              <span className="text-[9px] text-zinc-400">High-Res 2x</span>
            </button>

            <button
              onClick={() => setExportType('SVG')}
              className={`p-3 rounded-lg border flex flex-col items-center text-center gap-1.5 transition-all ${
                exportType === 'SVG'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Code className="w-5 h-5" />
              <span className="text-xs">Vector SVG</span>
              <span className="text-[9px] text-zinc-400">Lossless</span>
            </button>

            <button
              onClick={() => setExportType('REPORT')}
              className={`p-3 rounded-lg border flex flex-col items-center text-center gap-1.5 transition-all ${
                exportType === 'REPORT'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span className="text-xs">Lab Report</span>
              <span className="text-[9px] text-zinc-400">Print / PDF</span>
            </button>

            <button
              onClick={() => setExportType('JSON')}
              className={`p-3 rounded-lg border flex flex-col items-center text-center gap-1.5 transition-all ${
                exportType === 'JSON'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Data JSON</span>
              <span className="text-[9px] text-zinc-400">Topology</span>
            </button>
          </div>

          {/* Options */}
          {(exportType === 'PNG' || exportType === 'SVG') && (
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={e => setIncludeStats(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Include header summary watermark</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Embeds algorithm name, node/edge counts, and path cost.</p>
              </div>
            </label>
          )}

          {/* Graph summary preview */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 text-xs flex justify-between text-zinc-600 dark:text-zinc-400">
            <div><strong>{nodes.length}</strong> vertices, <strong>{edges.length}</strong> edges</div>
            <div>Theme: <span className="capitalize font-medium">{theme}</span></div>
          </div>

          {/* Status / Feedback messages */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (exportType === 'PNG') handleDownloadPng();
              else if (exportType === 'SVG') handleDownloadSvg();
              else if (exportType === 'REPORT') handlePrintReport();
              else if (exportType === 'JSON') handleDownloadJson();
            }}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isExporting ? 'Exporting...' : exportType === 'REPORT' ? 'Generate Lab Report' : `Export ${exportType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
