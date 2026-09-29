import React, { useState } from 'react';
import { Activity, Play, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { SRERecommendation } from '../types';

export const DayTwoSREView: React.FC = () => {
  const [data, setData] = useState<SRERecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSRECheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sre/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: 'payments_curated.transactions',
          file_count: 145,
          total_size_mb: 8500.0,
          monthly_queries: 25000,
        }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Autonomic Day-2 Lakehouse SRE &amp; FinOps</span>
          </h2>
          <p className="text-xs text-gray-400">
            Monitors Apache Iceberg table metadata ($files, $snapshots) and triggers Serverless Spark bin-packing only when FinOps ROI exceeds 2.5x.
          </p>
        </div>
        <button
          onClick={runSRECheck}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{loading ? 'Inspecting Metadata...' : 'Analyze Table Health'}</span>
        </button>
      </div>

      {data ? (
        <div className="glass-panel p-6 rounded-xl border border-indigo-500/40 space-y-5">
          <div className="flex items-center justify-between border-b border-google-border pb-3">
            <div>
              <span className="text-[11px] font-mono text-gray-400">Inspected Table</span>
              <h3 className="text-base font-bold text-white font-mono">{data.table_name}</h3>
            </div>
            <span
              className={`text-xs font-mono px-3 py-1 rounded-full font-bold border ${
                data.is_recommended
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-google-dark text-gray-400 border-google-border'
              }`}
            >
              {data.is_recommended ? 'COMPACTION RECOMMENDED (7.5x ROI)' : 'HEALTHY'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-google-dark p-3 rounded-lg border border-google-border">
              <div className="text-[11px] font-mono text-gray-400">Small Files Count</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">{data.current_small_files}</div>
            </div>
            <div className="bg-google-dark p-3 rounded-lg border border-google-border">
              <div className="text-[11px] font-mono text-gray-400">Avg File Size</div>
              <div className="text-xl font-bold text-white font-mono mt-1">{data.current_avg_file_size_mb} MB</div>
            </div>
            <div className="bg-google-dark p-3 rounded-lg border border-google-border">
              <div className="text-[11px] font-mono text-gray-400">Spark Compaction Cost</div>
              <div className="text-xl font-bold text-red-400 font-mono mt-1">${data.estimated_spark_compute_cost_usd}</div>
            </div>
            <div className="bg-google-dark p-3 rounded-lg border border-google-border">
              <div className="text-[11px] font-mono text-gray-400">30-Day Query Savings</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">${data.estimated_30day_query_scan_savings_usd}</div>
            </div>
          </div>

          <div className="bg-google-dark p-4 rounded-lg font-mono text-xs border border-google-border space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>AgentGuard Policy Verdict: {data.allowed_by_agent_guard ? 'ALLOWED' : 'BLOCKED'} (Risk: {data.risk_tier})</span>
            </div>
            <p className="text-gray-300">{data.audit_message}</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-xl text-center space-y-3 border border-google-border">
          <DollarSign className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Table Analysis Run Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Click &quot;Analyze Table Health&quot; to simulate BigQuery slot scan savings against Serverless Spark bin-packing rewrite costs.
          </p>
        </div>
      )}
    </div>
  );
};
