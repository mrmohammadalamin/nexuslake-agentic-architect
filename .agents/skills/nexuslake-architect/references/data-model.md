# NexusLake Data Model Reference: Canonical DataAsset & Connector Contracts

This document provides the standard Pydantic models, data structures, and interface definitions used by all NexusLake agents to represent, profile, and transform enterprise data estates.

---

## 1. Canonical `DataAsset` Model

```python
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

class SecurityClassification(str, Enum):
    PUBLIC             = "PUBLIC"
    INTERNAL           = "INTERNAL"
    CONFIDENTIAL       = "CONFIDENTIAL"
    RESTRICTED_PII     = "RESTRICTED_PII"
    RESTRICTED_PHI     = "RESTRICTED_PHI"
    FINANCIAL_SOX      = "FINANCIAL_SOX"

class ColumnSpec(BaseModel):
    name: str
    original_type: str
    target_iceberg_type: str
    ordinal_position: int
    is_nullable: bool = True
    is_primary_key: bool = False
    is_partition_key: bool = False
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
    completeness: float = Field(ge=0.0, le=1.0)
    uniqueness: float = Field(ge=0.0, le=1.0)
    validity: float = Field(ge=0.0, le=1.0)
    freshness_seconds: int
    corrupted_row_count: int = 0

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
    quality_profile: Optional[DataQualityScore] = None
    workload_profile: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    recommended_strategy: Optional[str] = None
    strategy_rationale: Optional[str] = None
```

---

## 2. Universal `SourceConnector` Interface Contract

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class SourceConnector(ABC):
    """Abstract interface that all system-specific connectors must implement."""

    def __init__(self, connection_params: Dict[str, Any]):
        self.params = connection_params

    @abstractmethod
    def validate_connection(self) -> bool:
        """Verify network connectivity and authentication."""
        pass

    @abstractmethod
    def discover_assets(self) -> List[str]:
        """Return list of asset IDs present in the source."""
        pass

    @abstractmethod
    def extract_schema(self, asset_id: str) -> List[ColumnSpec]:
        """Extract column definitions, native types, and constraints."""
        pass

    @abstractmethod
    def extract_statistics(self, asset_id: str) -> Dict[str, Any]:
        """Generate pushdown summaries (row count, min/max, null counts)."""
        pass

    @abstractmethod
    def extract_lineage(self, asset_id: str) -> Dict[str, List[str]]:
        """Parse query history or catalogs to determine dependencies."""
        pass

    @abstractmethod
    def estimate_volume(self, asset_id: str) -> Dict[str, float]:
        """Return estimated size in bytes and estimated egress fees."""
        pass

    @abstractmethod
    def build_batch_read_spec(self, asset_id: str, split_hints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate partition read descriptors for Serverless Spark."""
        pass

    @abstractmethod
    def initialize_cdc_stream(self, asset_id: str, checkpoint_token: Optional[str]) -> Dict[str, Any]:
        """Configure CDC capture parameters for Datastream."""
        pass
```

---

## 3. Supported Initial MVP Connectors

1. **PostgreSQL Connector:**
   - JDBC metadata inspection (`information_schema`, `pg_catalog`).
   - Pushdown HyperLogLog queries.
   - Logical replication slot integration via `pgoutput` for Datastream CDC.
2. **MongoDB Connector:**
   - Schema sampling across top N documents to handle polymorphic fields.
   - Change stream integration for CDC.
3. **Parquet / JSON Object Connector:**
   - GCS / S3 bucket crawler.
   - Schema inference via Apache Arrow / PyArrow.
   - Zero-copy registration descriptor generation for BigLake REST Catalog.
