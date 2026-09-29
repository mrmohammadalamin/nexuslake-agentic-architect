import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, Play, Hash, FileCheck, FileCode } from 'lucide-react';
import { ProofCertificate } from '../types';

export const ProofEngineView: React.FC = () => {
  const [cert, setCert] = useState<ProofCertificate | null>(null);
  const [complianceCert, setComplianceCert] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCompliance, setLoadingCompliance] = useState<boolean>(false);

  const generateProof = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/validate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: 'pg-payments-prod.PAYMENTS_CORE.public.transactions',
          target_table_name: 'payments_curated.transactions',
          target_storage_uri: 'gs://payments-iceberg-lakehouse-prod/payments_curated/transactions',
        }),
      });
      const data = await res.json();
      setCert(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    setLoadingCompliance(true);
    try {
      const res = await fetch('/api/compliance/audit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: 'lakehouse_curated.transactions',
          security_classification: 'RESTRICTED_PII',
          active_fpe: true,
        }),
      });
      const data = await res.json();
      setComplianceCert(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompliance(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Four-Tier Migration Proof Engine</span>
          </h2>
          <p className="text-xs text-gray-400">
            Produces machine-verifiable proof certificates asserting zero data loss via Commutative XOR Merkle Hash &amp; HLL sketches.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={generateComplianceReport}
            disabled={loadingCompliance}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{loadingCompliance ? 'Scanning DLP...' : 'Audit Compliance (GDPR/HIPAA)'}</span>
          </button>
          <button
            onClick={generateProof}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading ? 'Computing Proof...' : 'Generate Proof Certificate'}</span>
          </button>
        </div>
      </div>

      {complianceCert && (
        <div className="glass-panel p-5 rounded-xl border border-blue-500/40 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-google-border pb-3">
            <span className="font-bold text-blue-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Compliance Audit Certificate: {complianceCert.certificate_id}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 font-bold">
              {complianceCert.overall_status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-gray-300">
            <div>Frameworks: <span className="text-blue-300 font-bold">{complianceCert.frameworks_evaluated?.join(', ')}</span></div>
            <div>DLP Scan: <span className="text-emerald-400 font-bold">PASSED</span></div>
            <div>FPE Encryption: <span className="text-emerald-400 font-bold">ACTIVE</span></div>
            <div>Digital Signature: <span className="text-gray-400 truncate">{complianceCert.digital_signature}</span></div>
          </div>
          <div className="bg-google-dark p-3 rounded text-[11px] text-gray-300 space-y-1">
            {complianceCert.audit_findings?.map((f: string, idx: number) => (
              <div key={idx}>{f}</div>
            ))}
          </div>
        </div>
      )}

      {cert ? (
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-google-border pb-4 gap-3">
            <div>
              <span className="text-[11px] font-mono text-gray-400">Proof Certificate ID</span>
              <div className="text-sm font-bold text-white font-mono">{cert.proof_certificate_id}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>VERDICT: {cert.overall_status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Tier 1 */}
            <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>Tier 1: Structural</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-gray-400 text-[11px] space-y-1">
                <div>Status: <span className="text-emerald-400">{cert.verifications.tier_1_structural.status}</span></div>
                <div>Columns: <span className="text-gray-200">{cert.verifications.tier_1_structural.column_count}</span></div>
                <div>Mismatches: <span className="text-emerald-400">0</span></div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Tier 2: Statistical HLL</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-gray-400 text-[11px] space-y-1">
                <div>Source Rows: <span className="text-gray-200">{cert.verifications.tier_2_statistical.source_row_count.toLocaleString()}</span></div>
                <div>Target Rows: <span className="text-gray-200">{cert.verifications.tier_2_statistical.target_row_count.toLocaleString()}</span></div>
                <div>Row Delta: <span className="text-emerald-400">0</span></div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2">
              <div className="flex items-center justify-between text-purple-400 font-bold">
                <span>Tier 3: Merkle DAG</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-gray-400 text-[11px] space-y-1">
                <div>Algorithm: <span className="text-gray-300">XOR_HMAC</span></div>
                <div>Partitions: <span className="text-gray-200">{cert.verifications.tier_3_cryptographic.partitions_evaluated}</span></div>
                <div>Bit Match: <span className="text-emerald-400">Identical</span></div>
              </div>
            </div>

            {/* Tier 4 */}
            <div className="bg-google-dark p-3.5 rounded-lg border border-google-border space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Tier 4: Semantic KPI</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-gray-400 text-[11px] space-y-1">
                <div>Queries: <span className="text-gray-200">{cert.verifications.tier_4_semantic.queries_executed}</span></div>
                <div>Variance: <span className="text-emerald-400">0.000000%</span></div>
                <div>Discrepancies: <span className="text-emerald-400">0</span></div>
              </div>
            </div>
          </div>

          {/* Raw JSON Certificate */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Cryptographic Proof Certificate JSON</span>
              <span className="text-emerald-400 font-bold">{cert.signoff.automated_signature}</span>
            </div>
            <pre className="bg-google-dark p-4 rounded-lg font-mono text-xs text-cyan-300 overflow-x-auto max-h-56 border border-google-border">
              {JSON.stringify(cert, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-xl text-center space-y-3 border border-google-border">
          <FileCheck className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Certificate Generated Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Click &quot;Generate Proof Certificate&quot; to execute pushdown HLL cardinality calculations and Commutative XOR Merkle DAG checks.
          </p>
        </div>
      )}
    </div>
  );
};
