import React, { useState, useEffect } from 'react';
import { Database, Plus, Play, CheckCircle2, AlertCircle, Shield, Table, RefreshCw, ArrowRight } from 'lucide-react';
import { ConnectionConfig } from '../types';

export const DatabaseSourcesView: React.FC<{ onModernize: () => void }> = ({ onModernize }) => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [selectedConnId, setSelectedConnId] = useState<string>('');
  const [discoveredTables, setDiscoveredTables] = useState<string[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM transactions LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryRunning, setQueryRunning] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // New Connection Form State
  const [newConn, setNewConn] = useState({
    name: '',
    engine: 'PostgreSQL',
    database_name: '',
    host: 'localhost',
    port: 5432,
    username: 'admin',
  });

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/connections');
      const data = await res.json();
      setConnections(data);
      if (data.length > 0 && !selectedConnId) {
        setSelectedConnId(data[0].connection_id);
        fetchTables(data[0].connection_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (connId: string) => {
    try {
      const res = await fetch(`/api/connections/${connId}/tables`);
      const data = await res.json();
      setDiscoveredTables(data.tables || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleTestPing = async (connId: string) => {
    try {
      const res = await fetch(`/api/connections/${connId}/test`, { method: 'POST' });
      const data = await res.json();
      alert(`[${data.success ? 'SUCCESS' : 'FAILED'}] ${data.message}\nLatency: ${data.latency_ms}ms\nTables Found: ${data.discovered_tables_count}`);
    } catch (err) {
      alert('Error testing connection: ' + err);
    }
  };

  const handleAddConnection = async () => {
    if (!newConn.name || !newConn.database_name) {
      alert('Please fill in Connection Name and Database Name.');
      return;
    }
    try {
      const res = await fetch('/api/connections/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConn),
      });
      const data = await res.json();
      setShowAddForm(false);
      await fetchConnections();
      alert(`Database ${data.connection.name} successfully registered!`);
    } catch (err) {
      alert('Failed to register database: ' + err);
    }
  };

  const handleExecuteQuery = async () => {
    if (!selectedConnId) return;
    setQueryRunning(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const res = await fetch(`/api/connections/${selectedConnId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQueryError(data.detail || 'Query execution rejected by AgentGuard.');
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryError(err.message);
    } finally {
      setQueryRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Universal Database Source Manager</span>
          </h2>
          <p className="text-xs text-gray-400">
            Connect to any enterprise database source: PostgreSQL, MySQL, Oracle Exadata, SQL Server, Snowflake, MongoDB, BigQuery, and S3/GCS.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Database</span>
        </button>
      </div>

      {/* Add Connection Modal/Form */}
      {showAddForm && (
        <div className="glass-panel p-5 rounded-xl border border-blue-500/40 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Configure Database Connection</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-mono text-gray-400 mb-1">Connection Name</label>
              <input
                type="text"
                placeholder="e.g. Oracle CRM Production"
                value={newConn.name}
                onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-gray-400 mb-1">Database Engine</label>
              <select
                value={newConn.engine}
                onChange={(e) => setNewConn({ ...newConn, engine: e.target.value })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
                <option value="Oracle Exadata">Oracle Exadata</option>
                <option value="Microsoft SQL Server">Microsoft SQL Server</option>
                <option value="Snowflake">Snowflake</option>
                <option value="MongoDB">MongoDB</option>
                <option value="Google BigQuery">Google BigQuery</option>
                <option value="S3 / GCS Data Lake">S3 / GCS Data Lake</option>
                <option value="SQLite / In-Memory">SQLite / In-Memory</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-gray-400 mb-1">Database / Schema</label>
              <input
                type="text"
                placeholder="e.g. CRM_PROD"
                value={newConn.database_name}
                onChange={(e) => setNewConn({ ...newConn, database_name: e.target.value })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-gray-400 mb-1">Host / Endpoint</label>
              <input
                type="text"
                placeholder="db.internal.corp"
                value={newConn.host}
                onChange={(e) => setNewConn({ ...newConn, host: e.target.value })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-gray-400 mb-1">Port</label>
              <input
                type="number"
                value={newConn.port}
                onChange={(e) => setNewConn({ ...newConn, port: parseInt(e.target.value) || 5432 })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-gray-400 mb-1">Username</label>
              <input
                type="text"
                placeholder="app_user"
                value={newConn.username}
                onChange={(e) => setNewConn({ ...newConn, username: e.target.value })}
                className="w-full bg-google-dark border border-google-border rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold"
            >
              Test &amp; Save Connection
            </button>
          </div>
        </div>
      )}

      {/* Active Database Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((conn) => {
          const isSelected = selectedConnId === conn.connection_id;
          return (
            <div
              key={conn.connection_id}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-google-card border-blue-500/70 shadow-lg shadow-blue-500/10'
                  : 'bg-google-surface border-google-border hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedConnId(conn.connection_id);
                fetchTables(conn.connection_id);
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {conn.engine}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Ready</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{conn.name}</h3>
                <div className="text-xs font-mono text-gray-400 mt-1 space-y-0.5">
                  <div>DB: <span className="text-gray-200">{conn.database_name}</span></div>
                  <div>Host: <span className="text-gray-300">{conn.host || 'N/A'}:{conn.port || ''}</span></div>
                </div>
              </div>

              <div className="pt-2 border-t border-google-border flex items-center justify-between text-xs font-mono">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestPing(conn.connection_id);
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Test Ping
                </button>
                <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                  <span>Explore &amp; Query</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Query & Exploration Studio */}
      <div className="glass-panel p-5 rounded-xl border border-google-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-google-border gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Table className="w-4 h-4 text-emerald-400" />
              <span>Live Query &amp; Schema Explorer</span>
            </h3>
            <p className="text-xs text-gray-400">
              Execute safe read queries protected by the AgentGuard Action Firewall.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-gray-400">Active Connection:</span>
            <select
              value={selectedConnId}
              onChange={(e) => {
                setSelectedConnId(e.target.value);
                fetchTables(e.target.value);
              }}
              className="bg-google-dark border border-google-border rounded px-2.5 py-1 text-white focus:outline-none focus:border-blue-500"
            >
              {connections.map((c) => (
                <option key={c.connection_id} value={c.connection_id}>
                  {c.name} ({c.engine})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Tables Sidebar */}
          <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2">
            <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Discovered Tables ({discoveredTables.length})
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {discoveredTables.map((tbl) => (
                <div
                  key={tbl}
                  onClick={() => setSqlQuery(`SELECT * FROM ${tbl} LIMIT 10;`)}
                  className="p-2 rounded hover:bg-google-card text-xs font-mono text-gray-300 hover:text-white cursor-pointer flex items-center justify-between border border-transparent hover:border-google-border"
                >
                  <span className="truncate">{tbl}</span>
                  <span className="text-[10px] text-gray-500">table</span>
                </div>
              ))}
            </div>
          </div>

          {/* Query Editor */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">SQL Query Console</span>
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>AgentGuard Firewall Active</span>
              </span>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              className="w-full bg-google-dark border border-google-border rounded-lg p-3 font-mono text-xs text-yellow-300 focus:outline-none focus:border-blue-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setSqlQuery('SELECT * FROM transactions LIMIT 5;')}
                  className="text-xs bg-google-card border border-google-border px-2 py-1 rounded text-gray-300 hover:text-white font-mono"
                >
                  Sample 1
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT merchant_id, COUNT(*) FROM transactions GROUP BY 1;')}
                  className="text-xs bg-google-card border border-google-border px-2 py-1 rounded text-gray-300 hover:text-white font-mono"
                >
                  Aggregation
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleExecuteQuery}
                  disabled={queryRunning}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{queryRunning ? 'Running...' : 'Execute via AgentGuard'}</span>
                </button>
                <button
                  onClick={onModernize}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <span>Modernize to Iceberg &rarr;</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {queryError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded font-mono text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <div>
                  <strong>[AgentGuard Security Block]</strong> {queryError}
                </div>
              </div>
            )}

            {/* Query Results */}
            {queryResult && (
              <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Execution Time: {queryResult.execution_time_ms}ms</span>
                  <span className="text-emerald-400 font-bold">{queryResult.rows_returned} rows returned</span>
                </div>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-google-border bg-google-card">
                        {queryResult.columns.map((c: string) => (
                          <th key={c} className="p-2 text-gray-300 font-semibold">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.data.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-google-border/40 hover:bg-google-card/40">
                          {queryResult.columns.map((c: string) => (
                            <td key={c} className="p-2 text-gray-200">{String(row[c])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
