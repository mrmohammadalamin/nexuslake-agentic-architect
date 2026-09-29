"""
NexusLake Agentic Architect - Comprehensive Integration Test Suite
Validates connectors, canonical models, strategy planning, AgentGuard, transpiler, and proof engine.
"""

import pytest
from src.connectors.postgres_connector import PostgresConnector
from src.connectors.mongo_connector import MongoConnector
from src.connectors.file_connector import FileObjectConnector
from src.agents.discovery_agent import EstateDiscoveryAgent
from src.agents.strategy_agent import StrategyPlannerAgent
from src.agents.transpiler_agent import PipelineTranspilerAgent
from src.agents.sre_ops_agent import LakehouseSREAgent
from src.policies.agent_guard import ActionProposal, ActionType, AgentGuard, RiskTier
from src.validation.proof_engine import MigrationProofEngine
from src.models.data_asset import MigrationStrategyEnum


def test_estate_discovery():
    connectors = {
        "pg": PostgresConnector({"source_system_id": "pg-test", "database": "PAYMENTS"}),
        "mongo": MongoConnector({"source_system_id": "mongo-test", "database": "STORE"}),
        "file": FileObjectConnector({"source_system_id": "gcs-test", "bucket": "archive"}),
    }
    agent = EstateDiscoveryAgent(connectors)
    assets = agent.discover_entire_estate()
    assert len(assets) >= 7
    names = [a.name for a in assets]
    assert "transactions" in names
    assert "product_catalog" in names
    assert "web_clickstream_logs" in names


def test_agent_guard_destructive_rejection():
    guard = AgentGuard(cost_budget_usd=50.0)
    proposal = ActionProposal(
        action_id="act-drop-table",
        action_type=ActionType.RAW_SQL_EXECUTION,
        agent_name="TestAgent",
        target_resource="table:customers",
        payload={"sql": "DROP TABLE legacy_customers;"},
        rationale="Cleanup legacy table",
    )
    verdict = guard.evaluate_proposal(proposal)
    assert verdict.allowed is False
    assert any("Destructive command rejected" in v for v in verdict.policy_violations)


def test_strategy_wave_planning():
    connectors = {
        "pg": PostgresConnector({"source_system_id": "pg-test", "database": "PAYMENTS"}),
        "file": FileObjectConnector({"source_system_id": "gcs-test", "bucket": "archive"}),
    }
    assets = EstateDiscoveryAgent(connectors).discover_entire_estate()
    planner = StrategyPlannerAgent()
    blueprint = planner.plan_migration_waves(assets, "tenant-test", "prj-test")

    assert len(blueprint.waves) >= 1
    # Check that high-churn transactions got CDC
    txn_plan = next(
        t for wave in blueprint.waves for t in wave.tables if "transactions" in t.target_table_name
    )
    assert txn_plan.strategy == MigrationStrategyEnum.CDC

    # Check that clean GCS parquet got REGISTER
    parquet_plan = next(
        t for wave in blueprint.waves for t in wave.tables if "web_clickstream_logs" in t.target_table_name
    )
    assert parquet_plan.strategy == MigrationStrategyEnum.REGISTER


def test_pipeline_transpiler():
    transpiler = PipelineTranspilerAgent()
    sql_proc = """
    CREATE PROCEDURE summarize_sales()
    BEGIN
        SELECT merchant_id, SUM(amount_cents)/100.0 FROM raw_txns GROUP BY 1;
    END;
    """
    res = transpiler.transpile_procedure("task-sales", "teradata", sql_proc)
    assert res.semantic_equivalence_passed is True
    assert "def execute_pipeline" in res.transpiled_pyspark
    assert "assert abs(actual_gross - expected_gross) <= 1e-8" in res.unit_test_code


def test_migration_proof_engine():
    pg = PostgresConnector({"source_system_id": "pg-test", "database": "PAYMENTS"})
    asset = pg.build_canonical_asset("pg-test.PAYMENTS.public.transactions")
    engine = MigrationProofEngine()
    cert = engine.generate_proof_certificate(
        migration_job_id="job-test-01",
        source_asset=asset,
        target_table_name="curated.transactions",
        target_storage_uri="gs://curated-lake/transactions",
    )
    assert cert.overall_status == "CERTIFIED_VALID"
    assert cert.verifications.tier_1_structural.status == "PASSED"
    assert cert.verifications.tier_2_statistical.status == "PASSED"
    assert cert.verifications.tier_3_cryptographic.status == "PASSED"
    assert cert.verifications.tier_4_semantic.status == "PASSED"


def test_lakehouse_sre_finops():
    guard = AgentGuard(cost_budget_usd=100.0)
    sre = LakehouseSREAgent(guard)
    rec = sre.analyze_table_health("payments_curated.transactions", file_count=150, total_size_mb=6000.0)
    assert rec.is_recommended is True
    assert rec.roi_multiplier >= 2.5
    assert rec.policy_verdict.allowed is True


def test_dynamic_connection_manager():
    from src.connectors.dynamic_manager import (
        DynamicConnectionManager,
        ConnectionConfig,
        DatabaseEngineType,
    )
    manager = DynamicConnectionManager()
    
    # 1. Verify default seeded connections (Postgres, Mongo, Oracle, Snowflake, GCS)
    conns = manager.list_connections()
    assert len(conns) >= 5
    engines = [c["engine"] for c in conns]
    assert DatabaseEngineType.POSTGRESQL in engines
    assert DatabaseEngineType.ORACLE in engines
    assert DatabaseEngineType.SNOWFLAKE in engines

    # 2. Add custom MySQL connection
    custom = ConnectionConfig(
        connection_id="conn-custom-mysql",
        name="Inventory MySQL Replica",
        engine=DatabaseEngineType.MYSQL,
        host="mysql-replica.internal",
        database_name="INVENTORY_DB",
    )
    manager.register_connection(custom)
    test_res = manager.test_connection("conn-custom-mysql")
    assert test_res.success is True
    assert len(test_res.tables) > 0

    # 3. Live query execution
    q_res = manager.execute_live_query("conn-custom-mysql", "SELECT * FROM core_entities LIMIT 5;")
    assert q_res["rows_returned"] > 0
    assert "execution_time_ms" in q_res


def test_data_studio_workflow():
    """Validates the Next-Gen Data Studio: View, Clean, Visualize, and Iceberg Customization."""
    from src.connectors.dynamic_manager import DynamicConnectionManager
    manager = DynamicConnectionManager()

    # 1. Profile table
    prof = manager.get_table_profile("conn-pg-prod", "transactions")
    assert "columns" in prof
    assert len(prof["columns"]) > 0
    assert "sample_rows" in prof
    assert "visual_stats" in prof
    assert prof["visual_stats"]["overall_data_quality_score"] > 0

    # 2. Clean preview
    clean_res = manager.clean_sample_data(
        prof["sample_rows"],
        {"trim_strings": True, "impute_nulls": True, "mask_pii": True, "deduplicate": True},
    )
    assert clean_res["transformed_quality_score"] >= clean_res["initial_quality_score"]
    assert clean_res["modified_cells_count"] > 0

    # 3. Customize Iceberg
    custom_res = manager.generate_iceberg_customization({
        "table_name": "transactions",
        "target_dataset": "lakehouse_curated",
        "partition_column": "created_at",
        "partition_transform": "days",
    })
    assert "PARTITIONED BY (days(created_at))" in custom_res["iceberg_ddl"]
    assert custom_res["iceberg_format_version"] == 2

    # 4. Finalize migration
    mig_res = manager.execute_migration_job({
        "connection_id": "conn-pg-prod",
        "table_name": "transactions",
        "target_table": "lakehouse_curated.transactions",
        "target_location": "gs://lakehouse-iceberg-prod-01/lakehouse_curated/transactions",
    })
    assert mig_res["status"] == "COMPLETED"
    assert mig_res["biglake_catalog_registered"] is True


def test_multimodal_vectorizer_agent():
    from src.agents.multimodal_agent import MultimodalVectorizerAgent
    agent = MultimodalVectorizerAgent(embedding_dimensions=768)
    res = agent.process_media_file("gs://enterprise-lake/invoices/2026_Q3.pdf", "pdf")

    assert res.file_id.startswith("media-")
    assert res.media_type == "pdf"
    assert len(res.vector_embedding) == 768
    assert res.extracted_text is not None


def test_security_compliance_agent():
    from src.agents.security_compliance_agent import SecurityComplianceAgent
    sec_agent = SecurityComplianceAgent()

    # 1. FPE Tokenization test
    tokenized_card = sec_agent.format_preserving_encrypt("4111-2222-3333-4444")
    assert tokenized_card == "4111-****-****-4444"

    # 2. Compliance Certificate test
    cert = sec_agent.generate_compliance_certificate(
        table_name="lakehouse_curated.transactions",
        security_classification="RESTRICTED_PII",
        column_tags={"card_pan": "CRITICAL_PCI_PII", "email": "RESTRICTED_PII"},
    )
    assert cert.overall_status == "COMPLIANT_CERTIFIED"
    assert "GDPR" in cert.frameworks_evaluated
    assert cert.digital_signature.startswith("0x")


def test_advanced_cleansing_fuzzy_and_fpe():
    from src.connectors.dynamic_manager import DynamicConnectionManager
    manager = DynamicConnectionManager()

    sample_rows = [
        {"transaction_id": "t-1", "customer_name": "  Alice Smith  ", "email": "alice.smith@corp.com", "card_pan": "4111-1111-2222-3333"},
        {"transaction_id": "t-2", "customer_name": "Alice Smith", "email": "alice.smith@corp.com", "card_pan": "4111-1111-2222-3333"}, # Fuzzy duplicate
        {"transaction_id": "t-3", "customer_name": "Bob Johnson", "email": "bob.j@fintech.io", "card_pan": "5500-0000-1111-9988"},
    ]

    res = manager.clean_sample_data_advanced(sample_rows, {
        "fuzzy_similarity_threshold": 0.85,
        "enable_fpe_tokenization": True,
    })

    assert res["transformed_quality_score"] == 99
    assert res["fuzzy_duplicates_removed"] >= 1
    assert len(res["cleaned_rows"]) == 2
    assert "4111-****-****-3333" in res["cleaned_rows"][0]["card_pan"]



