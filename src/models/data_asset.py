"""
NexusLake Canonical DataAsset Model
Technology-neutral representation of all data estate assets.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssetType(str, Enum):
    RELATIONAL_TABLE   = "relational_table"
    VIEW               = "view"
    MATERIALIZED_VIEW  = "materialized_view"
    NOSQL_COLLECTION   = "nosql_collection"
    OBJECT_TABLE       = "object_table"
    STREAM_TOPIC       = "stream_topic"
    FILE_DATASET       = "file_dataset"
    MULTIMODAL_MEDIA   = "multimodal_media"
    VECTOR_INDEX       = "vector_index"


class SecurityClassification(str, Enum):
    PUBLIC             = "PUBLIC"
    INTERNAL           = "INTERNAL"
    CONFIDENTIAL       = "CONFIDENTIAL"
    RESTRICTED_PII     = "RESTRICTED_PII"
    RESTRICTED_PHI     = "RESTRICTED_PHI"
    FINANCIAL_SOX      = "FINANCIAL_SOX"
    GDPR_REGULATED     = "GDPR_REGULATED"
    HIPAA_PROTECTED    = "HIPAA_PROTECTED"
    PCI_DSS_PAYMENT    = "PCI_DSS_PAYMENT"


class ColumnSpec(BaseModel):
    name: str
    original_type: str
    target_iceberg_type: str
    ordinal_position: int
    is_nullable: bool = True
    is_primary_key: bool = False
    is_partition_key: bool = False
    is_vector_embedding: bool = False
    vector_dimensions: Optional[int] = None
    description: Optional[str] = None
    security_tag: Optional[SecurityClassification] = None


class PartitionTransform(str, Enum):
    IDENTITY = "identity"
    YEAR     = "year"
    MONTH    = "month"
    DAY      = "day"
    HOUR     = "hour"
    BUCKET   = "bucket"
    TRUNCATE = "truncate"


class IcebergPartitionField(BaseModel):
    source_column: str
    transform: PartitionTransform
    transform_param: Optional[int] = None
    target_name: str


class DataQualityScore(BaseModel):
    completeness: float = Field(default=1.0, ge=0.0, le=1.0)
    uniqueness: float = Field(default=1.0, ge=0.0, le=1.0)
    validity: float = Field(default=1.0, ge=0.0, le=1.0)
    freshness_seconds: int = 0
    corrupted_row_count: int = 0
    fuzzy_dedup_similarity_score: Optional[float] = 1.0


class MigrationStrategyEnum(str, Enum):
    REGISTER    = "REGISTER"     # Zero-copy metadata pointer (Parquet/ORC lakes)
    REPLICATE   = "REPLICATE"    # Direct bulk batch copy
    CDC         = "CDC"          # Continuous log-based replication
    TRANSFORM   = "TRANSFORM"    # Heavy schema restructuring / dialect transpilation
    REWRITE     = "REWRITE"      # Cleanse corrupted data during load
    REPARTITION = "REPARTITION"  # Change physical layout for query optimization
    AGGREGATE   = "AGGREGATE"    # Rollup high-volume raw data into curated metrics
    ARCHIVE     = "ARCHIVE"      # Cold storage tiering to GCS Archive
    VIRTUALIZE  = "VIRTUALIZE"   # Federate via BigLake without physical movement
    EXCLUDE     = "EXCLUDE"      # Dead/obsolete tables dropped from migration scope
    VECTORIZE   = "VECTORIZE"    # In-flight multimodal embedding extraction & indexing


class DataAsset(BaseModel):
    id: str = Field(description="Format: <source_system_id>.<database>.<schema>.<name>")
    name: str
    source_system: str
    asset_type: AssetType
    columns: List[ColumnSpec]
    statistics: Dict[str, Any] = Field(default_factory=dict)
    relationships: List[Dict[str, str]] = Field(default_factory=list)
    lineage_upstream: List[str] = Field(default_factory=list)
    lineage_downstream: List[str] = Field(default_factory=list)
    business_domain: Optional[str] = None
    security_classification: SecurityClassification = SecurityClassification.INTERNAL
    compliance_frameworks: List[str] = Field(default_factory=list)
    quality_profile: Optional[DataQualityScore] = None
    workload_profile: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    recommended_strategy: Optional[MigrationStrategyEnum] = None
    strategy_rationale: Optional[str] = None
    multimodal_attributes: Dict[str, Any] = Field(default_factory=dict)
