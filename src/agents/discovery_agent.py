"""
NexusLake EstateDiscoveryAgent
Connects to heterogeneous sources, extracts schemas, and builds the canonical DataAsset catalog.
"""

from typing import Dict, List
from src.connectors.base import SourceConnector
from src.models.data_asset import DataAsset


class EstateDiscoveryAgent:
    """Agent responsible for discovering and profiling the enterprise data estate."""

    def __init__(self, connectors: Dict[str, SourceConnector]):
        self.connectors = connectors

    def discover_entire_estate(self) -> List[DataAsset]:
        """Discovers all assets across registered connectors and populates canonical models."""
        discovered_assets: List[DataAsset] = []

        for conn_id, connector in self.connectors.items():
            if not connector.validate_connection():
                continue

            asset_ids = connector.discover_assets()
            for asset_id in asset_ids:
                asset = connector.build_canonical_asset(asset_id)
                discovered_assets.append(asset)

        return discovered_assets
