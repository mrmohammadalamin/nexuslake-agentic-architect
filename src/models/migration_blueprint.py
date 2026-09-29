"""
NexusLake Migration Blueprint Model
Declarative Migration-as-Code specification for multi-wave lakehouse migrations.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from src.models.data_asset import IcebergPartitionField, MigrationStrategyEnum


class TableIcebergLayout(BaseModel):
    format_version: int = 2
    target_file_size_bytes: int = 268435456  # 256 MB
    partition_spec: List[IcebergPartitionField] = Field(default_factory=list)
    sort_columns: List[str] = Field(default_factory=list)


class TableMigrationPlan(BaseModel):
    source_asset_id: str
    target_table_name: str
    strategy: MigrationStrategyEnum
    iceberg_layout: TableIcebergLayout = Field(default_factory=TableIcebergLayout)
    sanitization_rules: List[Dict[str, Any]] = Field(default_factory=list)
    transpilation_task_id: Optional[str] = None


class MigrationWave(BaseModel):
    wave_number: int
    wave_name: str
    concurrency_limit: int = 4
    tables: List[TableMigrationPlan]


class ValidationPolicy(BaseModel):
    engine: str = "FourTierProofEngine"
    max_allowed_row_discrepancy: int = 0
    max_allowed_metric_variance_ratio: float = 0.0
    proof_steps: List[str] = Field(
        default_factory=lambda: [
            "schemaFingerprintMatch",
            "hyperLogLogCardinalityCheck",
            "partitionLevelMerkleHashComparison",
            "semanticFinancialReconciliation",
        ]
    )


class DayTwoOperationsPolicy(BaseModel):
    auto_compaction_enabled: bool = True
    trigger_small_file_count: int = 20
    target_size_mb: int = 256
    max_slot_cost_budget_usd: float = 20.00
    retain_snapshots_days: int = 30
    clean_orphan_files_interval_hours: int = 24


class MigrationBlueprint(BaseModel):
    api_version: str = "nexuslake.ai/v1alpha1"
    kind: str = "MigrationBlueprint"
    blueprint_id: str
    tenant_id: str
    target_gcp_project: str
    region: str = "us-central1"
    catalog_uri: str = "biglake.googleapis.com"
    lakehouse_bucket: str
    dataplex_lake: str
    dataplex_zone: str
    waves: List[MigrationWave]
    validation_policy: ValidationPolicy = Field(default_factory=ValidationPolicy)
    day_two_policy: DayTwoOperationsPolicy = Field(default_factory=DayTwoOperationsPolicy)
