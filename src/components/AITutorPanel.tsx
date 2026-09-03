import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AITutorPanelProps {
  isOpen: boolean;
  currentAlgorithm: string;
  onClose: () => void;
  buildContext: () => any;
  externalQuery?: string;
  onExternalQueryHandled?: () => void;
}

export function AITutorPanel({ isOpen, onClose, buildContext, externalQuery, onExternalQueryHandled, currentAlgorithm }: AITutorPanelProps) {
  const [messages, setMessages] = useState<{role: 'user'|'model', content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getQuickActions = (algo: string) => {
    switch (algo) {
      case 'BFS': return ["Explain BFS", "Why is this path shortest?", "Compare BFS with Dijkstra"];
      case 'DIJKSTRA': return ["Explain this execution", "Why was this node selected?", "Why can't Dijkstra use negative weights?"];
      case 'BELLMAN_FORD': return ["Explain the relaxation", "Check for a negative cycle", "Compare Bellman-Ford with Dijkstra"];
      case 'FLOYD_WARSHALL': return ["Explain the matrix", "Why did this distance change?", "Explain the current intermediate vertex"];
      case 'DAG_SHORTEST_PATH': return ["Explain the topological order", "Why must the graph be acyclic?"];
      case 'A_STAR': return ["Explain the heuristic", "Why did A* choose this node?", "Compare A* with Dijkstra"];
      case 'JOHNSON': return ["Explain reweighting", "Why does Johnson's use Bellman-Ford?"];
      case 'BIDIRECTIONAL': return ["Explain the two searches", "Where did the searches meet?"];
      case 'DIAL': return ["Explain the buckets", "Why must weights be integers?"];
      case 'SPFA': return ["Explain the queue", "Why was this node re-added?", "Check for a negative cycle"];
      default: return ["Explain this algorithm", "Why was this node selected?"];
    }
  };

  const quickActions = getQuickActions(currentAlgorithm);


  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current && messagesEndRef.current.parentElement) {
        const parent = messagesEndRef.current.parentElement;
        parent.scrollTo({
          top: parent.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalQuery && isOpen) {
      handleSend(externalQuery);
      onExternalQueryHandled?.();
    }
  }, [externalQuery, isOpen]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: buildContext()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API Error');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: error instanceof Error ? error.message : "PATHFINDER AI is temporarily unavailable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-0 top-0 bottom-0 surface-panel border-l border-zinc-200/50 dark:border-zinc-800/50 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-full sm:w-[600px] sm:max-w-[90vw]' : 'w-full sm:w-[350px]'}`}>
      {/* Header */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">PATHFINDER AI</h2>
            <p className="text-[10px] text-zinc-500 font-medium">Your algorithm tutor</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setMessages([])}
            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title={isExpanded ? "Collapse Panel" : "Expand Panel"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <Bot className="w-10 h-10 text-zinc-400" />
            <div className="text-xs text-zinc-500">
              <p className="mb-2 font-medium">Ask about the current algorithm...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {quickActions.map(action => (
                  <button key={action} onClick={() => handleSend(action)} className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-left">{action}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-black/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-200'}`}>
              {msg.role === 'model' ? (
                <div className="w-full overflow-x-auto font-sans [&>p]:mb-2 [&_table]:w-full [&_table]:mb-2 [&_th]:border [&_th]:border-zinc-300 dark:[&_th]:border-zinc-700 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-zinc-100 dark:[&_th]:bg-zinc-800 [&_td]:border [&_td]:border-zinc-300 dark:[&_td]:border-zinc-700 [&_td]:px-2 [&_td]:py-1 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-2 [&_ul:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-2 [&_ol:last-child]:mb-0 [&_li]:mb-1 [&_code]:bg-black/5 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px] [&_pre]:overflow-x-auto [&_pre]:bg-black/5 [&_pre]:dark:bg-white/10 [&_pre]:p-2 [&_pre]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                  <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs font-medium tracking-widest text-zinc-500">THINKING...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about the current algorithm..."
            className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-full px-4 py-2 text-[13px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors hover:bg-indigo-700"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
