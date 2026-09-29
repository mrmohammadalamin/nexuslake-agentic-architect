import React, { useState, useEffect } from 'react';
import { GitFork, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { MigrationBlueprint } from '../types';

export const WavePlannerView: React.FC = () => {
  const [blueprint, setBlueprint] = useState<MigrationBlueprint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWavePlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/strategy/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 'global-payments-corp', gcp_project: 'prj-lakehouse-prod-01' }),
      });
      const data = await res.json();
      setBlueprint(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWavePlan();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-purple-400" />
            <span>Autonomous Migration Wave Planner (DAG)</span>
          </h2>
          <p className="text-xs text-gray-400">
            Topologically resolved dependency graph sequenced into cutover waves balancing network bandwidth and risk.
          </p>
        </div>
        <button
          onClick={fetchWavePlan}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Re-Solve Dependency DAG</span>
        </button>
      </div>

      {blueprint && (
        <div className="space-y-5">
          {blueprint.waves.map((wave) => (
            <div key={wave.wave_number} className="glass-panel p-5 rounded-xl space-y-4 border border-google-border">
              <div className="flex items-center justify-between border-b border-google-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-purple-900/60 border border-purple-600/60 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">
                    {wave.wave_number}
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono">{wave.wave_name}</h3>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-google-dark text-purple-300 border border-google-border">
                    Concurrency: {wave.concurrency_limit}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                    SLA: High
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wave.tables.map((tbl, idx) => {
                  const isCDC = tbl.strategy === 'CDC';
                  const isRegister = tbl.strategy === 'REGISTER';
                  return (
                    <div
                      key={idx}
                      className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2 hover:border-gray-600 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{tbl.target_table_name}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isCDC
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : isRegister
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {tbl.strategy}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 truncate">{tbl.source_asset_id}</div>
                      <div className="pt-2 border-t border-google-border/60 flex items-center justify-between text-[11px] font-mono text-gray-400">
                        <span>Format: Iceberg v2</span>
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Layout Ready</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
