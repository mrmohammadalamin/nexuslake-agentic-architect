"""
NexusLake MongoDB Connector
Handles NoSQL document collections, schema sampling for polymorphic documents, and change streams.
"""

from typing import Any, Dict, List, Optional
from src.connectors.base import SourceConnector
from src.models.data_asset import ColumnSpec, SecurityClassification


class MongoConnector(SourceConnector):
    """MongoDB source connector with polymorphic document sampling and change streams."""

    def validate_connection(self) -> bool:
        return True

    def discover_assets(self) -> List[str]:
        prefix = self.params.get("source_system_id", "mongo-ecom-cluster")
        db = self.params.get("database", "catalog_store")
        return [
            f"{prefix}.{db}.product_catalog",
            f"{prefix}.{db}.customer_reviews",
            f"{prefix}.{db}.shopping_carts",
        ]

    def extract_schema(self, asset_id: str) -> List[ColumnSpec]:
        col_name = asset_id.split(".")[-1]
        if col_name == "product_catalog":
            return [
                ColumnSpec(
                    name="_id",
                    original_type="ObjectId",
                    target_iceberg_type="string",
                    ordinal_position=1,
                    is_nullable=False,
                    is_primary_key=True,
                ),
                ColumnSpec(
                    name="sku",
                    original_type="String",
                    target_iceberg_type="string",
                    ordinal_position=2,
                    is_nullable=False,
                ),
                ColumnSpec(
                    name="title",
                    original_type="String",
                    target_iceberg_type="string",
                    ordinal_position=3,
                    is_nullable=False,
                ),
                ColumnSpec(
                    name="attributes",
                    original_type="Document",
                    target_iceberg_type="string",  # Flattend / JSON string or Map
                    ordinal_position=4,
                    is_nullable=True,
                ),
                ColumnSpec(
                    name="price_usd",
                    original_type="Double",
                    target_iceberg_type="double",
                    ordinal_position=5,
                    is_nullable=False,
                ),
                ColumnSpec(
                    name="category_path",
                    original_type="Array[String]",
                    target_iceberg_type="list<string>",
                    ordinal_position=6,
                    is_nullable=True,
                ),
            ]
        return [
            ColumnSpec(
                name="_id",
                original_type="ObjectId",
                target_iceberg_type="string",
                ordinal_position=1,
                is_nullable=False,
                is_primary_key=True,
            )
        ]

    def extract_statistics(self, asset_id: str) -> Dict[str, Any]:
        return {
            "document_count": 2_400_000,
            "total_bytes": 3_600_000_000,
            "avg_doc_bytes": 1500,
            "write_churn_qps": 42.0,
            "polymorphic_schema_variance_pct": 8.4,
            "workload": {
                "read_preference": "secondaryPreferred",
                "frequent_filter_fields": ["category_path", "sku"],
            },
        }

    def extract_lineage(self, asset_id: str) -> Dict[str, List[str]]:
        return {
            "upstream": ["pim-service.product-syncer"],
            "downstream": ["recommendation-engine.feature-store"],
        }

    def estimate_volume(self, asset_id: str) -> Dict[str, float]:
        stats = self.extract_statistics(asset_id)
        size_gb = stats["total_bytes"] / (1024**3)
        return {
            "size_gb": round(size_gb, 3),
            "estimated_egress_usd": round(size_gb * 0.08, 2),
        }

    def build_batch_read_spec(self, asset_id: str, split_hints: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "format": "mongo",
            "spark.mongodb.read.connection.uri": "mongodb+srv://secret@mongo-ecom.internal",
            "spark.mongodb.read.database": asset_id.split(".")[-2],
            "spark.mongodb.read.collection": asset_id.split(".")[-1],
            "partitioner": "MongoSamplePartitioner",
            "partitionKey": "_id",
        }

    def initialize_cdc_stream(self, asset_id: str, checkpoint_token: Optional[str]) -> Dict[str, Any]:
        return {
            "engine": "datastream_or_dataflow",
            "source": "mongo_change_stream",
            "pipeline": "beam_mongo_to_iceberg_curated",
            "checkpoint": checkpoint_token or "RESUME_TOKEN_LATEST",
        }
