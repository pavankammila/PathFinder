import React, { useState, useRef } from 'react';
import { X, Camera, Upload, AlertTriangle } from 'lucide-react';
import { recognizeGraphFromImage } from '../camera';
import { DetectedGraph, RecognitionResult } from '../camera/types';
import { ReviewScreen } from './camera/ReviewScreen';
import { Graph } from '../types';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (graph: Graph) => void;
  hasExistingGraph: boolean;
}

export function CameraModal({ isOpen, onClose, onImport, hasExistingGraph }: CameraModalProps) {
  const [mode, setMode] = useState<'CAMERA' | 'UPLOAD'>('UPLOAD');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setRecognitionResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setIsAnalyzing(true);
    const result = await recognizeGraphFromImage(imageUrl);
    setRecognitionResult(result);
    setIsAnalyzing(false);
  };
  
  const handleRetry = () => {
    setRecognitionResult(null);
  };
  
  const handleUploadAnother = () => {
    setImageUrl(null);
    setRecognitionResult(null);
    setMode('UPLOAD');
  };

  // If we have a successful result, show the review screen
  if (recognitionResult?.status === 'SUCCESS' && recognitionResult.graph && imageUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">
        <div className="surface-panel rounded-lg shadow-xl w-full h-full max-w-6xl overflow-hidden">
          <ReviewScreen 
            initialGraph={recognitionResult.graph} 
            imageUrl={imageUrl} 
            hasExistingGraph={hasExistingGraph}
            onImport={(g) => { onImport(g); onClose(); }} 
            onCancel={onClose} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="surface-panel rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Camera Input
          </h2>
          <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {recognitionResult?.status === 'UNAVAILABLE' || recognitionResult?.status === 'ERROR' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <AlertTriangle className="w-16 h-16 text-amber-500" />
            <div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">Graph Recognition Unavailable</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {recognitionResult.message || "Graph recognition is not available."}
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-3 mt-4">
              <button onClick={handleRetry} className="px-4 py-3 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors">
                RETRY
              </button>
              <button onClick={handleUploadAnother} className="px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:bg-zinc-200 dark:bg-zinc-800 transition-colors">
                UPLOAD ANOTHER IMAGE
              </button>
              <button onClick={onClose} className="px-4 py-3 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
                BUILD MANUALLY
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
              <button 
                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${mode === 'CAMERA' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800'}`}
                onClick={() => { setMode('CAMERA'); setImageUrl(null); }}
              >
                Start Camera
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${mode === 'UPLOAD' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800'}`}
                onClick={() => { setMode('UPLOAD'); setImageUrl(null); }}
              >
                Upload Image
              </button>
            </div>

            <div className="p-6 bg-zinc-100 dark:bg-zinc-800/50 flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {imageUrl ? (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <img src={imageUrl} alt="Preview" className="max-h-64 object-contain border border-zinc-200 dark:border-zinc-800 rounded shadow-sm" />
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="w-full px-4 py-3 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isAnalyzing ? 'ANALYZING...' : 'ANALYZE GRAPH'}
                  </button>
                </div>
              ) : mode === 'CAMERA' ? (
                <div className="flex flex-col items-center text-center space-y-4 text-zinc-500 dark:text-zinc-400">
                  <Camera className="w-12 h-12 text-zinc-300" />
                  <p className="text-sm">Camera view is not available in this environment.</p>
                  <button 
                    onClick={() => setMode('UPLOAD')} 
                    className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors mt-2"
                  >
                    SWITCH TO UPLOAD
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-4 text-zinc-500 dark:text-zinc-400 w-full">
                  <Upload className="w-12 h-12 text-zinc-300" />
                  <p className="text-sm">Select an image containing a graph to analyze.</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors mt-2"
                  >
                    SELECT IMAGE
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
