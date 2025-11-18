import React, { useEffect, useState } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';

interface LoadingTerminalProps {
  query: string;
}

const STEPS = [
  "System Initializing...",
  "Connecting to Global Market Database...",
  "Protocol 1: Real-time Search Synchronization...",
  "Verifying Ticker Symbol & Exchange Data...",
  "Analyzing Macro Economic Indicators...",
  "Scanning EDGAR/DART Filings...",
  "Calculating Financial Ratios (PER, PBR, ROE)...",
  "Simulating 3-Scenario Strategy (Plan A/B/C)...",
  "Compiling Ultimate Investment Report..."
];

export const LoadingTerminal: React.FC<LoadingTerminalProps> = ({ query }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < STEPS.length) {
        setLogs(prev => [...prev, `> ${STEPS[currentIndex]}`]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800); // Add a new line every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden font-mono text-sm">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-400" />
          <span className="text-slate-300 font-semibold">CIO_Process_Monitor.exe</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div className="p-6 h-96 overflow-y-auto flex flex-col gap-2">
        <div className="text-cyan-400 mb-2">Target Asset: "{query}"</div>
        {logs.map((log, index) => (
          <div key={index} className="text-emerald-500/90 animate-pulse">
            {log}
          </div>
        ))}
        <div className="flex items-center gap-2 text-slate-500 mt-auto pt-4 border-t border-slate-800/50">
          <RefreshCw className="animate-spin" size={14} />
          <span>Processing complex data models...</span>
        </div>
      </div>
    </div>
  );
};