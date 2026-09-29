"""
NexusLake Proof Certificate Model
Machine-verifiable audit certificate produced by the Four-Tier Migration Proof Engine.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class Tier1StructuralProof(BaseModel):
    status: str = "PASSED"
    source_schema_sha256: str
    target_schema_sha256: str
    column_count: int
    type_mismatches: int = 0


class Tier2StatisticalProof(BaseModel):
    status: str = "PASSED"
    source_row_count: int
    target_row_count: int
    row_count_delta: int = 0
    hll_cardinality_precision: int = 14
    source_hll_estimate: int
    target_hll_estimate: int
    null_count_parity: bool = True


class Tier3CryptographicProof(BaseModel):
    status: str = "PASSED"
    algorithm: str = "COMMUTATIVE_XOR_HMAC_SHA256"
    source_root_merkle_hash: str
    target_root_merkle_hash: str
    partitions_evaluated: int
    bit_level_match: bool = True


class Tier4SemanticProof(BaseModel):
    status: str = "PASSED"
    queries_executed: int
    financial_metric_variance: float = 0.0
    discrepancies_found: int = 0


class ProofVerifications(BaseModel):
    tier_1_structural: Tier1StructuralProof
    tier_2_statistical: Tier2StatisticalProof
    tier_3_cryptographic: Tier3CryptographicProof
    tier_4_semantic: Tier4SemanticProof


class GovernanceVerification(BaseModel):
    dataplex_policy_tags_applied: int = 0
    pii_columns_masked: List[str] = Field(default_factory=list)
    access_control_synced: bool = True


class ProofSignoff(BaseModel):
    agent: str = "ReconciliationProofAgent"
    model: str = "Gemini 2.5 Flash"
    automated_signature: str


class ProofCertificate(BaseModel):
    schema_uri: str = Field(default="https://nexuslake.ai/schemas/proof-certificate-v1.json", alias="$schema")
    proof_certificate_id: str
    timestamp: str
    migration_job_id: str
    source_system: Dict[str, Any]
    target_system: Dict[str, Any]
    verifications: ProofVerifications
    governance: GovernanceVerification
    overall_status: str = "CERTIFIED_VALID"
    signoff: ProofSignoff

    model_config = ConfigDict(populate_by_name=True)
