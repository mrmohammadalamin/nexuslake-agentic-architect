import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { DataAsset } from '../types';

export const EstateDiscoveryView: React.FC = () => {
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/estate/assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runReProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/estate/discover', { method: 'POST' });
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Discovered Data Estate</span>
          </h2>
          <p className="text-xs text-gray-400">
            Automated profiling across relational, NoSQL, and Cloud Storage lakes into canonical DataAssets.
          </p>
        </div>
        <button
          onClick={runReProfile}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Profile Estate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const hasPII = asset.columns.some((c) => c.security_tag);
          return (
            <div
              key={asset.id}
              className="glass-panel p-5 rounded-xl border border-google-border hover:border-blue-500/50 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-google-dark text-blue-300 font-semibold border border-google-border">
                  {asset.source_system}
                </span>
                <span className="text-xs font-mono text-gray-400">{asset.columns.length} cols</span>
              </div>

              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white">{asset.name}</h3>
                {hasPII && (
                  <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>PII Detected</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400 font-mono break-all line-clamp-1">{asset.id}</p>

              <div className="text-xs text-gray-300 pt-2 border-t border-google-border space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Row Count:</span>
                  <strong className="text-white">{(asset.statistics.row_count || 0).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Write Churn:</span>
                  <strong className="text-emerald-400">{asset.statistics.write_churn_qps || 0} QPS</strong>
                </div>
                {asset.recommended_strategy && (
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-400">Strategy:</span>
                    <span className="font-bold text-blue-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-800">
                      {asset.recommended_strategy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
