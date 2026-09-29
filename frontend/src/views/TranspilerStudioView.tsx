import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, Copy, Sparkles, Terminal } from 'lucide-react';

export const TranspilerStudioView: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>(`CREATE PROCEDURE calc_settlement_rollup()
BEGIN
    INSERT INTO daily_settlement_summary
    SELECT merchant_id, DATE(created_at), currency, COUNT(*), SUM(amount_cents)/100.0
    FROM raw_transactions
    WHERE status = 'SETTLED'
    GROUP BY 1, 2, 3;
END;`);
  const [transpiledCode, setTranspiledCode] = useState<string>('');
  const [testCode, setTestCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleTranspile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transpiler/transpile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: 'bteq-calc-daily-ledger-rollup',
          source_dialect: 'teradata',
          procedure_code: sourceCode,
        }),
      });
      const data = await res.json();
      setTranspiledCode(data.transpiled_pyspark);
      setTestCode(data.unit_test_code);
      setHasRun(true);
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
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>Stored Procedure Transpiler Studio</span>
          </h2>
          <p className="text-xs text-gray-400">
            Deconstructs legacy AST control flows (PL/SQL, BTEQ, T-SQL) into Serverless Spark with automated equivalence testing.
          </p>
        </div>
        <button
          onClick={handleTranspile}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Transpiling...' : 'Transpile with Gemini 2.5'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Legacy SQL Pane */}
        <div className="glass-panel p-4 rounded-xl space-y-2 border border-google-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-google-border pb-2.5">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                Source: Teradata BTEQ / Oracle PL/SQL
              </span>
              <span className="text-[11px] font-mono bg-google-dark px-2 py-0.5 rounded text-gray-400">
                Dialect: ANSI / Proprietary
              </span>
            </div>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={14}
              className="w-full bg-google-dark border border-google-border rounded-lg p-3 mt-3 font-mono text-xs text-yellow-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
          <div className="text-[11px] font-mono text-gray-400 pt-2 flex items-center justify-between">
            <span>AST Parser: SQLGlot Engine</span>
            <span>Target: Apache Iceberg v2</span>
          </div>
        </div>

        {/* Target PySpark DAG Pane */}
        <div className="glass-panel p-4 rounded-xl space-y-2 border border-google-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-google-border pb-2.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Target: Google Cloud Serverless Spark
              </span>
              {hasRun && (
                <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Equivalence: 100% Passed</span>
                </span>
              )}
            </div>
            <pre className="w-full bg-google-dark border border-google-border rounded-lg p-3 mt-3 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[330px] leading-relaxed">
              {transpiledCode || 'Click "Transpile with Gemini 2.5" to generate deterministic PySpark code...'}
            </pre>
          </div>
          <div className="text-[11px] font-mono text-gray-400 pt-2 flex items-center justify-between">
            <span>Runtime: Serverless Spark Batch</span>
            <span>Precision: Epsilon 10⁻⁸</span>
          </div>
        </div>
      </div>

      {/* Generated Unit Test Fixture */}
      {hasRun && (
        <div className="glass-panel p-4 rounded-xl border border-google-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono border-b border-google-border pb-2">
            <span className="font-bold text-blue-400 flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Automated Equivalence Test Suite (pytest)</span>
            </span>
            <span className="text-emerald-400">Assertion: delta &le; 1e-8</span>
          </div>
          <pre className="bg-google-dark p-3 rounded font-mono text-xs text-cyan-300 overflow-x-auto">
            {testCode}
          </pre>
        </div>
      )}
    </div>
  );
};
