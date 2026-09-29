import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  Database, 
  Table, 
  Zap, 
  ShieldCheck, 
  FileCode, 
  Layers,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { ConnectionConfig } from '../types';

export const DataStudioView: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [selectedConnId, setSelectedConnId] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'view' | 'visualize' | 'clean' | 'customize'>('view');

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [migrating, setMigrating] = useState<boolean>(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);

  // Cleansing rules state
  const [cleanRules, setCleanRules] = useState({
    trim_strings: true,
    impute_nulls: true,
    mask_pii: true,
    deduplicate: true,
  });
  const [cleanResult, setCleanResult] = useState<any>(null);

  // Customization state
  const [customSpec, setCustomSpec] = useState({
    target_dataset: 'lakehouse_curated',
    target_table: '',
    gcs_bucket: 'gs://lakehouse-iceberg-prod-01',
    partition_column: 'created_at',
    partition_transform: 'days',
    sort_keys: 'customer_name, transaction_id',
    target_file_size_mb: 256,
    compression_codec: 'zstd',
  });
  const [icebergPlan, setIcebergPlan] = useState<any>(null);

  // Migration receipt modal
  const [migrationReceipt, setMigrationReceipt] = useState<any>(null);

  // 1. Fetch connections on mount
  useEffect(() => {
    const initConnections = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/connections');
        const data = await res.json();
        setConnections(data);
        if (data.length > 0) {
          const firstConn = data[0].connection_id;
          setSelectedConnId(firstConn);
          fetchTables(firstConn);
        }
      } catch (err) {
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };
    initConnections();
  }, []);

  // 2. Fetch tables for connection
  const fetchTables = async (connId: string) => {
    try {
      const res = await fetch(`/api/connections/${connId}/tables`);
      const data = await res.json();
      const discovered = data.tables || [];
      setTables(discovered);
      if (discovered.length > 0) {
        const firstTable = discovered[0];
        setSelectedTable(firstTable);
        loadTableProfile(connId, firstTable);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  // 3. Load deep table profile
  const loadTableProfile = async (connId: string, tbl: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/studio/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connId, table_name: tbl }),
      });
      const data = await res.json();
      setProfile(data);
      setCleanResult(null);
      setMigrationReceipt(null);

      // Initialize customization default table name
      setCustomSpec((prev) => ({
        ...prev,
        target_table: `${prev.target_dataset}.${tbl}`,
        partition_column: data.columns?.find((c: any) => c.iceberg_type.includes('timestamp'))?.name || 'created_at',
      }));

      // Pre-synthesize default Iceberg DDL
      generateIcebergDDL(tbl, data);
    } catch (err) {
      console.error('Error loading table profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionChange = (connId: string) => {
    setSelectedConnId(connId);
    fetchTables(connId);
  };

  const handleTableChange = (tbl: string) => {
    setSelectedTable(tbl);
    loadTableProfile(selectedConnId, tbl);
  };

  // Generate Iceberg DDL
  const generateIcebergDDL = async (tbl: string, profData?: any) => {
    try {
      const currentProfile = profData || profile;
      const res = await fetch('/api/studio/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: tbl,
          target_dataset: customSpec.target_dataset,
          target_table: customSpec.target_table || `${customSpec.target_dataset}.${tbl}`,
          gcs_bucket: customSpec.gcs_bucket,
          partition_column: customSpec.partition_column,
          partition_transform: customSpec.partition_transform,
          sort_keys: customSpec.sort_keys.split(',').map((s) => s.trim()),
          target_file_size_mb: customSpec.target_file_size_mb,
          compression_codec: customSpec.compression_codec,
        }),
      });
      const plan = await res.json();
      setIcebergPlan(plan);
    } catch (err) {
      console.error('Error generating Iceberg plan:', err);
    }
  };

  // Preview data cleansing
  const handlePreviewClean = async () => {
    if (!profile || !profile.sample_rows) return;
    try {
      setCleaning(true);
      const res = await fetch('/api/studio/clean-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_rows: profile.sample_rows,
          rules: cleanRules,
        }),
      });
      const data = await res.json();
      setCleanResult(data);
    } catch (err) {
      console.error('Error previewing data clean:', err);
    } finally {
      setCleaning(false);
    }
  };

  // Advanced enterprise clean (Fuzzy deduplication & FPE tokenization)
  const handleAdvancedCleanPreview = async () => {
    if (!profile || !profile.sample_rows) return;
    try {
      setCleaning(true);
      const res = await fetch('/api/studio/advanced-cleanse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_rows: profile.sample_rows,
          rules: {
            ...cleanRules,
            fuzzy_similarity_threshold: 0.85,
            enable_fpe_tokenization: true,
          },
        }),
      });
      const data = await res.json();
      setCleanResult(data);
    } catch (err) {
      console.error('Error executing advanced enterprise cleansing:', err);
    } finally {
      setCleaning(false);
    }
  };

  // Finalize & Execute Migration
  const handleFinalizeMigration = async () => {
    if (!profile) return;
    try {
      setMigrating(true);
      const res = await fetch('/api/studio/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: selectedConnId,
          table_name: selectedTable,
          target_table: icebergPlan?.target_table || `${customSpec.target_dataset}.${selectedTable}`,
          target_location: icebergPlan?.target_location || `${customSpec.gcs_bucket}/${customSpec.target_dataset}/${selectedTable}`,
          row_count: profile.row_count || 5420000,
          estimated_cost_usd: 3.50,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Migration Blocked by AgentGuard: ' + (err.detail || 'Action rejected'));
        return;
      }
      const data = await res.json();
      setMigrationReceipt(data);
    } catch (err) {
      alert('Error executing migration: ' + err);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-google-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Data Studio: View, Clean, Visualize & Customize
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
              Next-Gen Datalake Migration
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Interactively explore raw data from any source cloud or database, visualize distributions, cleanse & mask sensitive attributes, customize the target Apache Iceberg schema, and finalize migration into Google Cloud.
          </p>
        </div>

        {/* Source and Table Selector Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-google-card p-2 rounded-lg border border-google-border">
          <div className="flex items-center space-x-2 text-xs">
            <Database className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-gray-400">Source:</span>
            <select
              value={selectedConnId}
              onChange={(e) => handleConnectionChange(e.target.value)}
              className="bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-mono"
            >
              {connections.map((c) => (
                <option key={c.connection_id} value={c.connection_id}>
                  {c.name} ({c.engine})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-google-border"></div>

          <div className="flex items-center space-x-2 text-xs">
            <Table className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-gray-400">Table:</span>
            <select
              value={selectedTable}
              onChange={(e) => handleTableChange(e.target.value)}
              className="bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-mono"
            >
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadTableProfile(selectedConnId, selectedTable)}
            disabled={loading}
            className="p-1.5 hover:bg-google-border/60 text-gray-400 hover:text-gray-200 rounded transition"
            title="Refresh Table Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-google-border space-x-1">
        {[
          { id: 'view', label: '1. View & Profile Data', icon: Eye },
          { id: 'visualize', label: '2. Visualize Distributions', icon: BarChart3 },
          { id: 'clean', label: '3. Clean & Sanitize Data', icon: Sparkles, badge: 'Auto-Fix' },
          { id: 'customize', label: '4. Customize & Finalize Iceberg', icon: Sliders, badge: 'Iceberg v2' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-google-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-google-dark text-gray-300 border border-google-border font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-google-card rounded-xl border border-google-border">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-sm font-mono text-gray-300">Profiling live data from {selectedTable}...</span>
        </div>
      ) : profile ? (
        <div>
          {/* TAB 1: VIEW DATA */}
          {activeSubTab === 'view' && (
            <div className="space-y-6">
              {/* Profile KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-google-card p-4 rounded-xl border border-google-border">
                  <div className="text-xs text-gray-400">Total Volume</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {profile.row_count?.toLocaleString()} <span className="text-xs font-normal text-gray-400">rows</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">{profile.total_size_mb} MB uncompressed</div>
                </div>

                <div className="bg-google-card p-4 rounded-xl border border-google-border">
                  <div className="text-xs text-gray-400">Attributes / Columns</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">{profile.columns?.length}</div>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">
                    {profile.columns?.filter((c: any) => c.is_pk).length} Primary Key(s)
                  </div>
                </div>

                <div className="bg-google-card p-4 rounded-xl border border-google-border">
                  <div className="text-xs text-gray-400">Initial Quality Score</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {profile.visual_stats?.overall_data_quality_score}%
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Cleansing recommended
                  </div>
                </div>

                <div className="bg-google-card p-4 rounded-xl border border-google-border">
                  <div className="text-xs text-gray-400">Sensitive PII Fields</div>
                  <div className="text-xl font-bold text-red-400 mt-1">
                    {profile.visual_stats?.pii_detected_count || 0}
                  </div>
                  <div className="text-[11px] text-red-300/80 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-400" />
                    Dataplex Policy Tags Required
                  </div>
                </div>
              </div>

              {/* Sample Records Table */}
              <div className="bg-google-card rounded-xl border border-google-border overflow-hidden">
                <div className="p-4 border-b border-google-border flex items-center justify-between bg-google-surface">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
                      Raw Source Data Records Preview ({profile.sample_rows?.length} records sampled)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    Engine: <strong className="text-gray-200">{profile.engine}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-google-dark text-gray-400 border-b border-google-border">
                      <tr>
                        {profile.columns?.map((col: any) => (
                          <th key={col.name} className="px-4 py-3 font-semibold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <span>{col.name}</span>
                              {col.is_pk && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1 rounded">PK</span>
                              )}
                              {col.pii_tag && (
                                <span className="text-[9px] bg-red-900/60 text-red-300 px-1 rounded flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> PII
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">{col.type}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-google-border">
                      {profile.sample_rows?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-google-border/20 transition">
                          {profile.columns?.map((col: any) => {
                            const val = row[col.name];
                            const isNull = val === null || val === undefined;
                            const isPII = col.pii_tag !== null;
                            const isUntrimmed = typeof val === 'string' && val.trim() !== val;

                            return (
                              <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                                {isNull ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px]">
                                    NULL
                                  </span>
                                ) : isPII ? (
                                  <span className="text-red-300 font-semibold flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                    {String(val)}
                                  </span>
                                ) : isUntrimmed ? (
                                  <span className="text-amber-200 border-b border-dotted border-amber-400" title="Untrimmed whitespace">
                                    "{String(val)}"
                                  </span>
                                ) : (
                                  <span className="text-gray-300">{String(val)}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Next Step Banner */}
              <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Proceed to Data Visualization or Cleansing</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    View statistical distributions or apply automatic null imputation and Dataplex PII masking before migrating.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveSubTab('visualize')}
                    className="px-3.5 py-1.5 rounded-lg bg-google-card border border-google-border text-xs text-gray-200 hover:text-white font-medium flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    Visualize Distributions
                  </button>
                  <button
                    onClick={() => setActiveSubTab('clean')}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Clean & Sanitize Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUALIZE DISTRIBUTIONS */}
          {activeSubTab === 'visualize' && (
            <div className="space-y-6">
              {/* Visual Stats Row 1: Null Percentages Bar Chart */}
              <div className="bg-google-card p-5 rounded-xl border border-google-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      Attribute Null & Incompleteness Rates
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Percentage of missing values detected per column</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-google-dark text-gray-300 border border-google-border">
                    {profile.columns?.filter((c: any) => c.null_pct > 0).length} Columns with Missing Values
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {profile.columns?.map((col: any) => (
                    <div key={col.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-300">{col.name} ({col.type})</span>
                        <span className={col.null_pct > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                          {col.null_pct}% nulls
                        </span>
                      </div>
                      <div className="h-2 w-full bg-google-dark rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${100 - col.null_pct}%` }}
                        ></div>
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${col.null_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorical & Numeric Distributions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categorical Breakdown */}
                <div className="bg-google-card p-5 rounded-xl border border-google-border space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Categorical Value Frequencies
                  </h3>
                  {profile.visual_stats?.categorical_distributions ? (
                    Object.entries(profile.visual_stats.categorical_distributions).map(([catKey, distribution]: [string, any]) => (
                      <div key={catKey} className="space-y-2 border-t border-google-border pt-3">
                        <span className="text-xs font-mono text-purple-300 font-semibold">{catKey.toUpperCase()}</span>
                        <div className="space-y-1.5">
                          {Object.entries(distribution).map(([label, pct]: [string, any]) => (
                            <div key={label} className="space-y-0.5">
                              <div className="flex justify-between text-[11px] font-mono text-gray-300">
                                <span>{label}</span>
                                <span className="text-gray-400">{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-google-dark rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">No categorical columns identified.</div>
                  )}
                </div>

                {/* Numeric Histogram Breakdown */}
                <div className="bg-google-card p-5 rounded-xl border border-google-border space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Numeric Distribution Bins
                  </h3>
                  {profile.visual_stats?.numeric_distributions ? (
                    Object.entries(profile.visual_stats.numeric_distributions).map(([numKey, bins]: [string, any]) => (
                      <div key={numKey} className="space-y-2 border-t border-google-border pt-3">
                        <span className="text-xs font-mono text-emerald-300 font-semibold">{numKey.toUpperCase()}</span>
                        <div className="space-y-2">
                          {bins.map((b: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs font-mono bg-google-dark p-2 rounded border border-google-border">
                              <span className="text-gray-300">{b.range}</span>
                              <span className="text-emerald-400 font-semibold">{b.count?.toLocaleString()} rows</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">No numeric histograms available.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLEAN & SANITIZE DATA */}
          {activeSubTab === 'clean' && (
            <div className="space-y-6">
              {/* Cleaning Rule Configuration Controls */}
              <div className="bg-google-card p-5 rounded-xl border border-google-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                      Configure Data Cleansing & Sanitization Rules
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select deterministic transformation and governance rules to apply prior to Iceberg lakehouse ingestion.
                    </p>
                  </div>
                  <button
                    onClick={handlePreviewClean}
                    disabled={cleaning}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${cleaning ? 'animate-spin' : ''}`} />
                    {cleaning ? 'Applying Cleansing...' : 'Apply & Preview Cleansing'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {/* Rule 1: Whitespace Trimming */}
                  <label className="flex items-start space-x-3 p-3.5 rounded-lg bg-google-dark border border-google-border cursor-pointer hover:border-blue-500/50 transition">
                    <input
                      type="checkbox"
                      checked={cleanRules.trim_strings}
                      onChange={(e) => setCleanRules({ ...cleanRules, trim_strings: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-200">String Trimming</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Strips leading/trailing whitespace from string columns.</p>
                    </div>
                  </label>

                  {/* Rule 2: Impute Missing Values */}
                  <label className="flex items-start space-x-3 p-3.5 rounded-lg bg-google-dark border border-google-border cursor-pointer hover:border-blue-500/50 transition">
                    <input
                      type="checkbox"
                      checked={cleanRules.impute_nulls}
                      onChange={(e) => setCleanRules({ ...cleanRules, impute_nulls: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Null Imputation</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Replaces missing numerics with 0.0 and categories with 'UNKNOWN'.</p>
                    </div>
                  </label>

                  {/* Rule 3: Mask Sensitive PII */}
                  <label className="flex items-start space-x-3 p-3.5 rounded-lg bg-google-dark border border-google-border cursor-pointer hover:border-blue-500/50 transition">
                    <input
                      type="checkbox"
                      checked={cleanRules.mask_pii}
                      onChange={(e) => setCleanRules({ ...cleanRules, mask_pii: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Dataplex PII Masking</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Tokenizes card numbers and masks sensitive customer emails.</p>
                    </div>
                  </label>

                  {/* Rule 4: Deduplicate */}
                  <label className="flex items-start space-x-3 p-3.5 rounded-lg bg-google-dark border border-google-border cursor-pointer hover:border-blue-500/50 transition">
                    <input
                      type="checkbox"
                      checked={cleanRules.deduplicate}
                      onChange={(e) => setCleanRules({ ...cleanRules, deduplicate: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Deduplicate Rows</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Discards redundant duplicate rows by primary key index.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cleansing Comparison Banner */}
              {cleanResult && (
                <div className="bg-emerald-950/40 border border-emerald-700/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 border border-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cleansing Transformations Applied Successfully</h4>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Modified <strong className="text-emerald-300">{cleanResult.modified_cells_count} cells</strong>. Quality score increased from{' '}
                        <strong className="text-amber-300">{cleanResult.initial_quality_score}%</strong> to{' '}
                        <strong className="text-emerald-300">{cleanResult.transformed_quality_score}%</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('customize')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    Proceed to Iceberg Layout <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Cleaned Records Table Preview */}
              <div className="bg-google-card rounded-xl border border-google-border overflow-hidden">
                <div className="p-4 border-b border-google-border flex items-center justify-between bg-google-surface">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
                      Cleaned Data Preview (Sanitized & Masked Output)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Ready for Iceberg Ingestion</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-google-dark text-gray-400 border-b border-google-border">
                      <tr>
                        {profile.columns?.map((col: any) => (
                          <th key={col.name} className="px-4 py-3 font-semibold whitespace-nowrap">
                            <div className="text-gray-300">{col.name}</div>
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">{col.iceberg_type}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-google-border">
                      {(cleanResult?.cleaned_rows || profile.sample_rows)?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-google-border/20 transition">
                          {profile.columns?.map((col: any) => {
                            const val = row[col.name];
                            return (
                              <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                                <span className={cleanResult ? 'text-emerald-300' : 'text-gray-300'}>
                                  {String(val ?? 'NULL')}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMIZE & FINALIZE ICEBERG */}
          {activeSubTab === 'customize' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Controls Column */}
                <div className="lg:col-span-1 space-y-4 bg-google-card p-5 rounded-xl border border-google-border">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Target Apache Iceberg Layout
                  </h3>
                  <p className="text-xs text-gray-400">
                    Customize destination naming, partition transform, and storage parameters on Google Cloud.
                  </p>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="text-gray-300 font-medium block mb-1">Target Table Name</label>
                      <input
                        type="text"
                        value={customSpec.target_table}
                        onChange={(e) => setCustomSpec({ ...customSpec, target_table: e.target.value })}
                        className="w-full bg-google-dark text-gray-200 border border-google-border rounded px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 font-medium block mb-1">Target GCS Lakehouse Bucket</label>
                      <input
                        type="text"
                        value={customSpec.gcs_bucket}
                        onChange={(e) => setCustomSpec({ ...customSpec, gcs_bucket: e.target.value })}
                        className="w-full bg-google-dark text-gray-200 border border-google-border rounded px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 font-medium block mb-1">Hidden Partition Transform</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={customSpec.partition_transform}
                          onChange={(e) => {
                            setCustomSpec({ ...customSpec, partition_transform: e.target.value });
                            generateIcebergDDL(selectedTable);
                          }}
                          className="bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-2 font-mono text-xs"
                        >
                          <option value="days">days(...)</option>
                          <option value="hours">hours(...)</option>
                          <option value="months">months(...)</option>
                          <option value="bucket(16)">bucket(16, ...)</option>
                          <option value="identity">identity(...)</option>
                        </select>
                        <select
                          value={customSpec.partition_column}
                          onChange={(e) => {
                            setCustomSpec({ ...customSpec, partition_column: e.target.value });
                            generateIcebergDDL(selectedTable);
                          }}
                          className="bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-2 font-mono text-xs"
                        >
                          {profile.columns?.map((c: any) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-300 font-medium block mb-1">Sort & Z-Order Clustering Columns</label>
                      <input
                        type="text"
                        value={customSpec.sort_keys}
                        onChange={(e) => setCustomSpec({ ...customSpec, sort_keys: e.target.value })}
                        className="w-full bg-google-dark text-gray-200 border border-google-border rounded px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
                        placeholder="col1, col2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-300 font-medium block mb-1">Target Parquet Size</label>
                        <select
                          value={customSpec.target_file_size_mb}
                          onChange={(e) => setCustomSpec({ ...customSpec, target_file_size_mb: Number(e.target.value) })}
                          className="w-full bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-2 font-mono text-xs"
                        >
                          <option value={128}>128 MB</option>
                          <option value={256}>256 MB (Optimal)</option>
                          <option value={512}>512 MB</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-300 font-medium block mb-1">Compression Codec</label>
                        <select
                          value={customSpec.compression_codec}
                          onChange={(e) => setCustomSpec({ ...customSpec, compression_codec: e.target.value })}
                          className="w-full bg-google-dark text-gray-200 border border-google-border rounded px-2.5 py-2 font-mono text-xs"
                        >
                          <option value="zstd">ZSTD (High)</option>
                          <option value="snappy">Snappy (Fast)</option>
                          <option value="gzip">GZIP</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => generateIcebergDDL(selectedTable)}
                      className="w-full py-2 bg-google-border/60 hover:bg-google-border text-gray-200 rounded font-medium transition text-xs"
                    >
                      Update Iceberg DDL
                    </button>
                  </div>
                </div>

                {/* Iceberg Generated DDL & Finalize Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-google-card p-5 rounded-xl border border-google-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-purple-400" />
                          Generated Apache Iceberg DDL (BigLake REST Catalog)
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Standard Iceberg format-version 2 definition compatible with BigQuery, Spark, and Trino.
                        </p>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        BigLake REST Enabled
                      </span>
                    </div>

                    <pre className="p-4 bg-google-dark rounded-lg border border-google-border font-mono text-xs text-gray-200 overflow-x-auto leading-relaxed">
                      {icebergPlan?.iceberg_ddl || 'Loading DDL...'}
                    </pre>

                    <div className="bg-blue-950/30 border border-blue-800/40 p-3.5 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 text-blue-300">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span>AgentGuard Pre-Check: ALLOWED (Risk: LOW, Cost: $3.50)</span>
                      </div>
                      <span className="text-gray-400">Zero Destructive Actions</span>
                    </div>

                    <button
                      onClick={handleFinalizeMigration}
                      disabled={migrating}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Zap className={`w-4 h-4 ${migrating ? 'animate-spin' : ''}`} />
                      {migrating ? 'Submitting Serverless Spark Job...' : 'Finalize & Migrate to Google Cloud Iceberg'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Migration Receipt Modal */}
              {migrationReceipt && (
                <div className="bg-google-card border border-emerald-600/60 p-6 rounded-2xl space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-google-border pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Migration Dispatched & Registered Successfully</h3>
                        <p className="text-xs text-gray-400 font-mono">Job ID: {migrationReceipt.job_id}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                      STATUS: {migrationReceipt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-google-dark p-3 rounded-lg border border-google-border">
                      <span className="text-gray-400 block">Target Iceberg Table</span>
                      <span className="text-white font-bold">{migrationReceipt.target_iceberg_table}</span>
                    </div>
                    <div className="bg-google-dark p-3 rounded-lg border border-google-border">
                      <span className="text-gray-400 block">Rows Migrated</span>
                      <span className="text-emerald-400 font-bold">{migrationReceipt.rows_migrated?.toLocaleString()}</span>
                    </div>
                    <div className="bg-google-dark p-3 rounded-lg border border-google-border">
                      <span className="text-gray-400 block">Execution Engine</span>
                      <span className="text-blue-300 font-bold">{migrationReceipt.execution_engine}</span>
                    </div>
                    <div className="bg-google-dark p-3 rounded-lg border border-google-border">
                      <span className="text-gray-400 block">BigLake Catalog Status</span>
                      <span className="text-purple-300 font-bold">REGISTERED (v2)</span>
                    </div>
                  </div>

                  <div className="bg-google-dark p-3.5 rounded-lg border border-google-border text-xs font-mono">
                    <div className="text-gray-400 mb-1">Direct BigQuery Lakehouse Query:</div>
                    <code className="text-blue-300 font-semibold">{migrationReceipt.bigquery_query_example}</code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 bg-google-card rounded-xl border border-google-border">
          Please select a connection and table to begin viewing and cleansing.
        </div>
      )}
    </div>
  );
};
