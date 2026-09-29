"""
NexusLake Universal SourceConnector Base Interface
All technology-specific connectors implement this contract.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from src.models.data_asset import ColumnSpec, DataAsset


class SourceConnector(ABC):
    """Abstract interface that all system-specific connectors must implement."""

    def __init__(self, connection_params: Dict[str, Any]):
        self.params = connection_params

    @abstractmethod
    def validate_connection(self) -> bool:
        """Verify network reachability and authentication."""
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

    def build_canonical_asset(self, asset_id: str) -> DataAsset:
        """Factory method to assemble a full DataAsset from connector metadata."""
        cols = self.extract_schema(asset_id)
        stats = self.extract_statistics(asset_id)
        lineage = self.extract_lineage(asset_id)
        
        # Derive asset type and identifiers
        parts = asset_id.split(".")
        name = parts[-1]
        source_sys = self.params.get("source_system_id", "unknown-source")

        return DataAsset(
            id=asset_id,
            name=name,
            source_system=source_sys,
            asset_type="relational_table",
            columns=cols,
            statistics=stats,
            lineage_upstream=lineage.get("upstream", []),
            lineage_downstream=lineage.get("downstream", []),
            workload_profile=stats.get("workload", {})
        )
