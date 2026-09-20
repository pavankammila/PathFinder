import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Camera, Upload, AlertTriangle, RefreshCw, FlipHorizontal, 
  Sparkles, Check, Image as ImageIcon, CheckCircle2, AlertCircle, 
  ShieldCheck, ShieldAlert, Cpu, Clock, Activity, Scan
} from 'lucide-react';
import { recognizeGraphFromImage, validateImageForGraph, ImagePrecheckResult } from '../camera';
import { RecognitionResult } from '../camera/types';
import { ReviewScreen } from './camera/ReviewScreen';
import { Graph } from '../types';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (graph: Graph) => void;
  existingGraph: Graph;
}

export function CameraModal({ isOpen, onClose, onImport, existingGraph }: CameraModalProps) {
  const [mode, setMode] = useState<'CAMERA' | 'UPLOAD'>('CAMERA');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);

  // Pre-check validation state
  const [precheck, setPrecheck] = useState<ImagePrecheckResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState('Initializing pre-check...');
  const [precheckBypassed, setPrecheckBypassed] = useState(false);

  // AI Analysis progress state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('Initializing AI vision engine...');
  const [analysisElapsed, setAnalysisElapsed] = useState(0);

  // Camera stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsInitializingCamera(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setIsInitializingCamera(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or secure context. Please use the Upload Image option.');
      setIsInitializingCamera(false);
      return;
    }

    try {
      // Check available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Enumerate error is non-fatal
      }

      // Try preferred constraints
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err: any) {
        console.warn('Initial camera constraints failed, falling back to basic video:', err);
        // Fallback to basic video constraint if overconstrained
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsStreaming(true);
        setIsInitializingCamera(false);
      }
    } catch (err: any) {
      console.error('Failed to access camera:', err);
      setIsInitializingCamera(false);
      setIsStreaming(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser or switch to image upload.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on this computer. Please use the Upload Image option.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another application. Please close other camera apps and retry.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please check camera permissions or upload an image.');
      }
    }
  }, [facingMode, stopCamera]);

  // Handle modal visibility and camera lifecycle
  useEffect(() => {
    if (isOpen && mode === 'CAMERA' && !imageUrl && !recognitionResult) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, imageUrl, recognitionResult, facingMode, startCamera, stopCamera]);

  // Support clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              stopCamera();
              setImageUrl(ev.target?.result as string);
              setRecognitionResult(null);
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, stopCamera]);

  // Capture snapshot from video element
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    setImageUrl(dataUrl);
    setRecognitionResult(null);
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      stopCamera();
      setImageUrl(event.target?.result as string);
      setRecognitionResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        stopCamera();
        setImageUrl(event.target?.result as string);
        setRecognitionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run pre-check validation whenever a new image is loaded
  useEffect(() => {
    if (!imageUrl) {
      setPrecheck(null);
      setIsValidating(false);
      setValidationProgress(0);
      setValidationStatus('');
      setPrecheckBypassed(false);
      return;
    }

    let isMounted = true;
    setIsValidating(true);
    setValidationProgress(15);
    setValidationStatus('Sampling image pixel matrix...');
    setPrecheckBypassed(false);

    validateImageForGraph(imageUrl, (percent, status) => {
      if (isMounted) {
        setValidationProgress(percent);
        setValidationStatus(status);
      }
    })
      .then((result) => {
        if (isMounted) {
          setPrecheck(result);
          setValidationProgress(100);
          setValidationStatus('Pre-check completed');
          setTimeout(() => {
            if (isMounted) setIsValidating(false);
          }, 220);
        }
      })
      .catch((err) => {
        console.warn('Pre-check validation encountered an error:', err);
        if (isMounted) {
          setIsValidating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  // AI Vision progress simulation timer during analysis
  useEffect(() => {
    let intervalId: any = null;
    let startTime = Date.now();

    if (isAnalyzing) {
      setAnalysisProgress(8);
      setAnalysisStage('Uploading & preparing diagram image...');
      setAnalysisElapsed(0);
      startTime = Date.now();

      intervalId = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        setAnalysisElapsed(Math.round(elapsedSeconds * 10) / 10);

        setAnalysisProgress((prev) => {
          let next = prev;
          if (prev < 30) {
            next = prev + Math.random() * 4 + 2.5;
          } else if (prev < 65) {
            next = prev + Math.random() * 2.8 + 1.2;
          } else if (prev < 85) {
            next = prev + Math.random() * 1.4 + 0.6;
          } else if (prev < 96) {
            next = prev + 0.25;
          }
          const clamped = Math.min(96, Math.round(next));

          // Dynamically update human-readable stage descriptions based on progress
          if (clamped < 25) {
            setAnalysisStage('Uploading & preparing diagram image...');
          } else if (clamped < 50) {
            setAnalysisStage('Scanning image for vertices and circular node contours...');
          } else if (clamped < 72) {
            setAnalysisStage('Tracing edge paths, directional arrows & weights...');
          } else if (clamped < 88) {
            setAnalysisStage('Mapping spatial coordinates & node label tags...');
          } else {
            setAnalysisStage('Synthesizing structured graph data model...');
          }

          return clamped;
        });
      }, 80);
    } else {
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    // Check pre-check validation outcome
    if (precheck && !precheck.isValid && !precheckBypassed) {
      setRecognitionResult({
        status: 'ERROR',
        message: `Pre-check verification failed: ${precheck.message} Please capture or upload a clear graph diagram containing vertices (circles) and connecting lines.`
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await recognizeGraphFromImage(imageUrl);
      // Snap to 100% on successful recognition
      setAnalysisProgress(100);
      setAnalysisStage('Graph recognized successfully!');
      // Brief pause so the user perceives 100% completion before switching screens
      await new Promise((r) => setTimeout(r, 340));
      setRecognitionResult(result);
    } catch (err: any) {
      setRecognitionResult({
        status: 'ERROR',
        message: err.message || 'Failed to analyze the image.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleRetake = () => {
    setImageUrl(null);
    setRecognitionResult(null);
    setPrecheck(null);
    setIsValidating(false);
    setValidationProgress(0);
    setValidationStatus('');
    setPrecheckBypassed(false);
    setAnalysisProgress(0);
    setAnalysisElapsed(0);
    if (mode === 'CAMERA') {
      startCamera(facingMode);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImageUrl(null);
    setRecognitionResult(null);
    setPrecheck(null);
    setIsValidating(false);
    setValidationProgress(0);
    setValidationStatus('');
    setPrecheckBypassed(false);
    setAnalysisProgress(0);
    setAnalysisElapsed(0);
    onClose();
  };

  if (!isOpen) return null;

  // If recognition succeeded, transition to the review screen
  if (recognitionResult?.status === 'SUCCESS' && recognitionResult.graph && imageUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="surface-panel rounded-xl shadow-2xl w-full h-full max-w-6xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <ReviewScreen 
            initialGraph={recognitionResult.graph} 
            imageUrl={imageUrl} 
            existingGraph={existingGraph}
            onImport={(g) => { 
              stopCamera();
              onImport(g); 
              onClose(); 
            }} 
            onCancel={handleRetake} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="surface-panel rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Graph Recognition Camera
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Capture or upload any graph diagram, sketch, or textbook page
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Failure / Error notification view */}
        {recognitionResult && recognitionResult.status !== 'SUCCESS' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Graph Recognition Alert
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {recognitionResult.message || "Could not detect a clear graph in this photo. Please ensure vertices (circles) and connecting lines are well-lit and clearly drawn."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full gap-2.5 pt-2 max-w-sm">
              <button 
                onClick={handleRetake} 
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                TRY ANOTHER PHOTO
              </button>
              <button 
                onClick={handleClose} 
                className="px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Selector Tabs (only when not viewing a frozen preview) */}
            {!imageUrl && (
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-1">
                <button 
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'CAMERA' 
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/80 dark:border-zinc-800' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  onClick={() => {
                    setMode('CAMERA');
                    setImageUrl(null);
                  }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live Camera
                </button>
                <button 
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'UPLOAD' 
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/80 dark:border-zinc-800' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  onClick={() => {
                    stopCamera();
                    setMode('UPLOAD');
                    setImageUrl(null);
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </button>
              </div>
            )}

            {/* Main Content Area */}
            <div className="p-5 bg-zinc-100 dark:bg-zinc-900/60 flex flex-col items-center justify-center min-h-[340px]">
              {/* State 1: Photo captured/selected, ready to analyze or retake */}
              {imageUrl ? (
                <div className="flex flex-col items-center w-full space-y-4">
                  <div className="relative w-full max-h-72 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black flex items-center justify-center shadow-md">
                    <img 
                      src={imageUrl} 
                      alt="Captured graph preview" 
                      className="max-h-72 max-w-full object-contain" 
                    />
                    
                    {/* Corner badge during pre-check validation */}
                    {isValidating && !isAnalyzing && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-indigo-950/80 backdrop-blur-xs border border-indigo-500/40 text-indigo-200 text-[10px] font-semibold flex items-center gap-1.5 z-10 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                        <span>Pre-checking: {validationProgress}%</span>
                      </div>
                    )}

                    {/* Rich Visual AI Analysis Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-xs flex flex-col items-center justify-between text-white p-4 select-none z-20 overflow-hidden">
                        {/* High-tech scanning line and blueprint grid */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#38bdf8] animate-scanner"></div>
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf812_1px,transparent_1px),linear-gradient(to_bottom,#38bdf812_1px,transparent_1px)] bg-[size:24px_24px] opacity-70"></div>
                        </div>

                        {/* Top Bar: Active Status & Live Stopwatch */}
                        <div className="w-full flex items-center justify-between z-10">
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            <span>AI Vision Processing</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{analysisElapsed.toFixed(1)}s</span>
                          </div>
                        </div>

                        {/* Center Stage: Percentage Ring & Active Stage */}
                        <div className="flex flex-col items-center justify-center my-auto z-10 text-center px-4">
                          <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                            {/* Outer pulsating glow */}
                            <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-40"></div>
                            {/* Gradient spinning border */}
                            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                            {/* Inner circle with percentage */}
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-lg font-black font-mono tracking-tight text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
                                {analysisProgress}%
                              </span>
                            </div>
                          </div>

                          <p className="text-xs font-bold tracking-wider uppercase text-zinc-100 flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            Analyzing Graph Structure
                          </p>
                          <p className="text-[11px] text-cyan-200/90 mt-1 max-w-xs transition-all duration-150 leading-tight">
                            {analysisStage}
                          </p>
                        </div>

                        {/* Bottom: Glowing Progress Bar */}
                        <div className="w-full z-10 space-y-1.5">
                          <div className="w-full bg-zinc-900/90 rounded-full h-2 overflow-hidden border border-white/20 p-0.5 shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
                              style={{ width: `${analysisProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Scan className="w-3 h-3 text-cyan-400" />
                              Graph Structure Scanner
                            </span>
                            <span className="text-cyan-400 font-bold">{analysisProgress}% Complete</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pre-check Validation & AI Analysis Feedback Card */}
                  {isAnalyzing ? (
                    <div className="w-full p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/90 dark:bg-sky-950/30 text-left space-y-2 shadow-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
                          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-pulse shrink-0" />
                          <span>AI Graph Recognition in Progress</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {analysisProgress}% ({analysisElapsed.toFixed(1)}s)
                        </span>
                      </div>
                      <div className="w-full bg-sky-200/60 dark:bg-sky-900/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 rounded-full transition-all duration-100"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping shrink-0"></span>
                        <span className="truncate">{analysisStage}</span>
                      </p>
                    </div>
                  ) : isValidating ? (
                    <div className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-left space-y-2 shadow-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin shrink-0"></div>
                          <span>Pre-checking Image Quality & Structure</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {validationProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200/60 dark:bg-indigo-900/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-150"
                          style={{ width: `${validationProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span className="truncate">{validationStatus || 'Verifying node contours, line contrast & edge density...'}</span>
                      </p>
                    </div>
                  ) : precheck ? (
                    precheck.isValid ? (
                      <div className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-emerald-950/30 text-left space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Pre-Check Passed: Graph Structure Detected
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {precheck.score}% Confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                          {precheck.message}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400/90 font-mono">
                          <span>Edge Density: {precheck.edgeDensity}%</span>
                          <span>•</span>
                          <span>Contrast: {precheck.contrast}/255</span>
                          <span>•</span>
                          <span>Strokes & Nodes: OK</span>
                        </div>
                        {precheck.warning && (
                          <div className="mt-1 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{precheck.warning}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/30 text-left space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            Pre-Check Alert: No Graph Structures Detected
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Pre-Check Failed
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                          {precheck.message}
                        </p>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-rose-100 dark:border-rose-950">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Tips for diagram recognition:</span>
                          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10px]">
                            <li>Draw clearly circled nodes with letters or numbers (A, B, C...)</li>
                            <li>Draw visible connecting lines or arrows between nodes</li>
                            <li>Ensure good lighting without harsh shadows or camera blur</li>
                          </ul>
                        </div>
                        {!precheckBypassed ? (
                          <div className="pt-0.5 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500 dark:text-zinc-400 text-[10px]">
                              API request paused to prevent empty or invalid results.
                            </span>
                            <button
                              type="button"
                              onClick={() => setPrecheckBypassed(true)}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              Send to AI anyway →
                            </button>
                          </div>
                        ) : (
                          <div className="pt-0.5 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Pre-check override active: AI will attempt graph extraction.</span>
                          </div>
                        )}
                      </div>
                    )
                  ) : null}

                  <div className="flex gap-2.5 w-full">
                    <button 
                      onClick={handleRetake} 
                      disabled={isAnalyzing}
                      className="px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-750 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retake
                    </button>
                    <button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || isValidating || (!precheck?.isValid && !precheckBypassed)}
                      className={`flex-1 px-5 py-2.5 text-xs font-bold text-white rounded-lg disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 ${
                        !precheck?.isValid && !precheckBypassed
                          ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          <span>ANALYZING GRAPH ({analysisProgress}%)...</span>
                        </>
                      ) : isValidating ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          <span>VALIDATING ({validationProgress}%)...</span>
                        </>
                      ) : (!precheck?.isValid && !precheckBypassed) ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>PRE-CHECK FAILED</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>ANALYZE GRAPH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : mode === 'CAMERA' ? (
                /* State 2: Live Camera View */
                <div className="w-full flex flex-col items-center">
                  {cameraError ? (
                    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-sm space-y-3">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Camera Unavailable</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {cameraError}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 w-full">
                        <button 
                          onClick={() => startCamera(facingMode)}
                          className="flex-1 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                        <button 
                          onClick={() => {
                            stopCamera();
                            setMode('UPLOAD');
                          }}
                          className="flex-1 px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Use Upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-4/3 max-h-[300px] bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner flex items-center justify-center group">
                      {isInitializingCamera && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900/80 text-white">
                          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-2"></div>
                          <span className="text-xs font-semibold">Starting camera...</span>
                        </div>
                      )}

                      <video 
                        ref={videoRef} 
                        playsInline 
                        muted 
                        autoPlay
                        className="w-full h-full object-cover"
                      />

                      {/* Viewfinder reticle overlay */}
                      {isStreaming && (
                        <>
                          <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-lg">
                            {/* Reticle corner marks */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 -mt-0.5 -ml-0.5"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 -mt-0.5 -mr-0.5"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 -mb-0.5 -ml-0.5"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 -mb-0.5 -mr-0.5"></div>
                          </div>

                          {/* Top controls: Camera flip */}
                          {hasMultipleCameras && (
                            <button
                              onClick={handleToggleFacingMode}
                              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-colors"
                              title="Flip Camera"
                            >
                              <FlipHorizontal className="w-4 h-4" />
                            </button>
                          )}

                          {/* Bottom Capture Action */}
                          <div className="absolute bottom-3 inset-x-0 flex flex-col items-center justify-center z-10 gap-1.5">
                            <button 
                              onClick={handleCapture}
                              className="w-14 h-14 rounded-full bg-white p-1 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center group/btn"
                              title="Take Photo"
                            >
                              <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover/btn:bg-indigo-700 flex items-center justify-center transition-colors">
                                <Camera className="w-5 h-5 text-white" />
                              </div>
                            </button>
                            <span className="text-[10px] font-medium text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Tap to capture diagram
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* State 3: Upload Image View */
                <div 
                  className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-white dark:bg-zinc-900 ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]' 
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />

                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/60 mb-3">
                    <Upload className="w-7 h-7" />
                  </div>

                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    Choose an image or drop it here
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center max-w-xs mb-3">
                    Upload PNG, JPG, or screenshot of a graph sketch. You can also paste directly with <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-mono">Ctrl+V</kbd>.
                  </p>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs"
                  >
                    Select File
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
