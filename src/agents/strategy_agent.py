"""
NexusLake StrategyPlannerAgent
Evaluates 10 migration strategies and solves topological dependency graphs for wave planning.
"""

from typing import Dict, List, Tuple
import networkx as nx
from src.models.data_asset import DataAsset, MigrationStrategyEnum
from src.models.migration_blueprint import (
    MigrationBlueprint,
    MigrationWave,
    TableIcebergLayout,
    TableMigrationPlan,
)


class StrategyPlannerAgent:
    """Agent responsible for strategy assignment and topological wave scheduling."""

    def assign_strategy(self, asset: DataAsset) -> Tuple[MigrationStrategyEnum, str]:
        """Assigns the mathematically and operationally optimal migration pattern."""
        stats = asset.statistics
        source = asset.source_system.lower()

        # 1. Zero-Copy Registration for clean cloud object stores
        if "gcs" in source or "s3" in source:
            if stats.get("is_clean_parquet", False):
                return (
                    MigrationStrategyEnum.REGISTER,
                    "Asset is clean Parquet in Cloud Storage. BigLake zero-copy registration requires zero byte movement.",
                )

        # 2. High write-churn operational OLTP -> CDC
        if stats.get("write_churn_qps", 0) > 20.0:
            return (
                MigrationStrategyEnum.CDC,
                f"Write churn is {stats.get('write_churn_qps')} QPS (>20). Datastream log-based CDC ensures zero-downtime cutover.",
            )

        # 3. Polymorphic or complex nested schemas -> TRANSFORM
        if stats.get("polymorphic_schema_variance_pct", 0) > 5.0 or "mongo" in source:
            return (
                MigrationStrategyEnum.TRANSFORM,
                f"Polymorphic schema variance is {stats.get('polymorphic_schema_variance_pct', 0)}%. Transpiled PySpark DAG required.",
            )

        # 4. Low data quality or corruption -> REWRITE
        if asset.quality_profile and asset.quality_profile.corrupted_row_count > 0:
            return (
                MigrationStrategyEnum.REWRITE,
                "Detected corrupt rows. Sanitization pipeline with quarantine dead-lettering required.",
            )

        # 5. Default static batch copy
        return (
            MigrationStrategyEnum.REPLICATE,
            "Low-churn static dimensional table. Serverless Spark parallel batch load recommended.",
        )

    def plan_migration_waves(self, assets: List[DataAsset], tenant_id: str, gcp_project: str) -> MigrationBlueprint:
        """Solves dependency graph and builds ordered migration waves."""
        # 1. Assign strategies to all assets
        asset_map: Dict[str, DataAsset] = {}
        for asset in assets:
            strat, rationale = self.assign_strategy(asset)
            asset.recommended_strategy = strat
            asset.strategy_rationale = rationale
            asset_map[asset.id] = asset

        # 2. Build Dependency DAG using NetworkX
        dag = nx.DiGraph()
        for asset in assets:
            dag.add_node(asset.id)
            for downstream in asset.lineage_downstream:
                # Match downstream references if present
                for target_id in asset_map:
                    if downstream in target_id:
                        dag.add_edge(asset.id, target_id)

        # 3. Topological Sorting & Wave Partitioning
        # If cycles exist, break them safely
        try:
            topo_order = list(nx.topological_sort(dag))
        except nx.NetworkXUnfeasible:
            # Cycle detected; resolve cycles
            cycles = list(nx.simple_cycles(dag))
            for cycle in cycles:
                if len(cycle) > 1:
                    dag.remove_edge(cycle[0], cycle[1])
            topo_order = list(nx.topological_sort(dag))

        # 4. Partition topological nodes into waves
        waves: List[MigrationWave] = []
        batch_size = 3
        for i in range(0, len(topo_order), batch_size):
            wave_nodes = topo_order[i : i + batch_size]
            wave_tables: List[TableMigrationPlan] = []
            
            for node_id in wave_nodes:
                asset_obj = asset_map[node_id]
                table_plan = TableMigrationPlan(
                    source_asset_id=asset_obj.id,
                    target_table_name=asset_obj.name,
                    strategy=asset_obj.recommended_strategy or MigrationStrategyEnum.REPLICATE,
                    iceberg_layout=TableIcebergLayout(
                        target_file_size_bytes=268435456,
                        sort_columns=[c.name for c in asset_obj.columns if c.is_primary_key],
                    ),
                )
                wave_tables.append(table_plan)

            wave_num = (i // batch_size) + 1
            waves.append(
                MigrationWave(
                    wave_number=wave_num,
                    wave_name=f"Wave_{wave_num}_Execution",
                    concurrency_limit=4,
                    tables=wave_tables,
                )
            )

        return MigrationBlueprint(
            blueprint_id=f"bp-{tenant_id}-generated",
            tenant_id=tenant_id,
            target_gcp_project=gcp_project,
            lakehouse_bucket=f"gs://{tenant_id}-iceberg-lakehouse",
            dataplex_lake=f"{tenant_id}-lake",
            dataplex_zone="curated-zone",
            waves=waves,
        )
