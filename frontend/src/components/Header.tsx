import React from 'react';
import { Database, ShieldCheck, Cloud, Server, Sparkles, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 border-b border-google-border bg-google-surface sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-wide">Agentic Migration Architect</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60 font-mono">
                Apache Iceberg Sprint 2026
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-google-border mx-2 hidden sm:block"></div>

        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-gray-400 bg-google-dark px-3 py-1.5 rounded border border-google-border">
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
          <span>Project:</span>
          <span className="text-gray-200 font-semibold">prj-lakehouse-prod-01</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="hidden lg:flex items-center space-x-2 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-full text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>BigLake REST Catalog</span>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-950/50 border border-indigo-800/60 px-2.5 py-1 rounded-full text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>AgentGuard ON</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center font-bold text-white text-xs shadow-inner">
          GA
        </div>
      </div>
    </header>
  );
};
