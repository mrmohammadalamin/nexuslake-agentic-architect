---
name: nexuslake-architect
description: Master architecture, agent orchestration, and engineering lifecycle skill for NexusLake Agentic Architect - modernizing heterogeneous enterprise data estates into an open, governed Apache Iceberg lakehouse on Google Cloud.
---

# NexusLake Agentic Architect — Master Skill

## 1. Mission & Product North Star

NexusLake Agentic Architect is an AI-native data estate modernization platform that transforms complex, heterogeneous enterprise data—including relational databases, cloud warehouses, NoSQL systems, files, streaming/CDC sources, and unstructured media—into an open, governed, and AI-ready Apache Iceberg lakehouse on Google Cloud.

### Core Architectural Axiom
- **Gemini 2.5 Pro/Flash & Google ADK** act strictly as the reasoning, semantic translation, planning, and root-cause analysis layer.
- **Deterministic Google Cloud Services** (Serverless Spark, Datastream, Dataflow, Cloud Storage, BigLake REST Catalog, BigQuery) execute all bulk data movement, transformations, and mathematical verifications.
- **Rules of Safety:**
  1. LLMs NEVER move bulk data rows.
  2. LLMs NEVER execute destructive SQL or apply breaking schema mutations without deterministic policy gating (AgentGuard).
  3. LLMs NEVER handle raw production credentials directly (use Secret Manager & Workload Identity Federation).

---

## 2. Four-Plane System Architecture

Every component and agent in NexusLake operates within one of four decoupled architectural planes:

1. **Agentic Control Plane (Managed SaaS / Cloud Run / GKE):**
   - Orchestrates Gemini 2.5 agents, maintains the AgentGuard policy firewall, manages Migration-as-Code blueprints, and exposes the Natural Language Estate Cockpit.
2. **Data Intelligence Plane (Customer VPC / Metadata Perimeter):**
   - Universal connectors crawl metadata, statistics, and audit logs to build the canonical `DataAsset` graph. Hosts the Migration Proof Engine. Never exports raw data rows to the SaaS Control Plane.
3. **Deterministic Execution Plane (Customer Compute Tenant):**
   - Runs Google Cloud Serverless Spark, Datastream CDC, Dataflow, and Cloud DLP pipelines to execute approved migration jobs, batch loads, and in-flight vectorization.
4. **Governed Lakehouse Plane (Storage & Multi-Engine Serving):**
   - Houses Apache Iceberg v2 tables on Google Cloud Storage, unified under the **BigLake Iceberg REST Catalog**, secured by Dataplex Knowledge Catalog policy tags, and accessible to BigQuery, Spark, Trino, Flink, and Vertex AI.

---

## 3. Roster of Specialized Agents

The modernization platform deploys 12 specialized agents mapped across the lifecycle, plus continuous Day-2 operational agents.

### 1. `EstateDiscoveryAgent` (Stage 1: Discover)
- **Role:** Deep metadata, schema, and storage crawler.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** `SourceConnector.discover_assets()`, `extract_schema()`, Cloud Logging, JDBC metadata.
- **Responsibilities:** Crawls source databases, schemas, tables, partition specs, table sizes, and update frequencies. Emits canonical `DataAsset` objects.

### 2. `ComplexityAssessmentAgent` (Stage 2: Assess)
- **Role:** Migration complexity, risk, and FinOps TCO evaluator.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Cloud Monitoring API, source query audit logs, Pricing Calculator API.
- **Responsibilities:** Evaluates query concurrency, compute footprints, and WAN egress constraints. Computes a deterministic Complexity Score (1–100) and calculates 3-year TCO comparison.

### 3. `SemanticOntologyAgent` (Stage 3: Understand)
- **Role:** Business domain mapping, semantic entity resolution, and lineage builder.
- **Model:** Gemini 2.5 Pro.
- **Tools/APIs:** Dataplex Catalog API, LLM text classification, SQL query history parser.
- **Responsibilities:** Disambiguates cryptic table/column naming (e.g., `TXN_AMT_LCL` -> `transaction_amount_local_currency`), maps entities to business domains, and infers end-to-end data lineage.

### 4. `StrategyPlannerAgent` (Stage 4: Decide)
- **Role:** Multi-pattern strategy assigner and wave dependency planner.
- **Model:** Gemini 2.5 Pro.
- **Tools/APIs:** NetworkX graph solver, Migration Strategy Decision Matrix.
- **Responsibilities:** Assigns each `DataAsset` one of the 10 approved strategies (`REGISTER`, `REPLICATE`, `CDC`, `TRANSFORM`, etc.). Builds a topological DAG of assets to schedule migration waves.
- **Policy Gate:** **Mandatory Human Architect Sign-Off**.

### 5. `IcebergLayoutArchitect` (Stage 5: Design)
- **Role:** Physical storage and partition layout engineer.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Iceberg TableSpec generator, BigLake REST Catalog API.
- **Responsibilities:** Designs optimal Iceberg v2 table specs: hidden partitioning (e.g., `days(event_time)`), Z-Order clustering columns, target Parquet file sizes (256 MB), and Puffin statistic specs.

### 6. `DataHygieneAgent` (Stage 6: Clean)
- **Role:** Anomaly detection, data cleansing, and quarantine controller.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Serverless Spark data quality profiling, Cloud Dataprep rules.
- **Responsibilities:** Detects null violations, corrupted records, and invalid formats. Imputes missing fields where deterministic heuristics exist; routes irrecoverable rows to GCS quarantine buckets.

### 7. `PipelineTranspilerAgent` (Stage 7: Transform)
- **Role:** Legacy code and stored procedure transpiler.
- **Model:** Gemini 2.5 Pro.
- **Tools/APIs:** SQLGlot AST parser, PySpark compiler, pytest fixture runner.
- **Responsibilities:** Deconstructs legacy procedural logic (PL/SQL, BTEQ, T-SQL) into PySpark DAGs and Spark SQL. Synthesizes automated unit tests and executes reflection loops to guarantee semantic equivalence.

### 8. `MigrationOrchestratorAgent` (Stage 8: Migrate)
- **Role:** Dual-speed batch and CDC migration executor.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Datastream API, Serverless Spark Batches API, Cloud Storage API.
- **Responsibilities:** Orchestrates historical bulk loads and configures Datastream CDC pipelines. Coordinates catch-up streaming until replication lag is under 2 seconds.
- **Policy Gate:** **Mandatory Cutover Human Approval**.

### 9. `ReconciliationProofAgent` (Stage 9: Validate)
- **Role:** Four-tier mathematical and semantic proof engine.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** BigQuery SQL pushdown, HyperLogLog algorithms, HMAC-SHA256 hasher.
- **Responsibilities:** Executes structural, statistical, cryptographic Merkle DAG, and semantic business query reconciliation. Emits a machine-verifiable JSON Proof Certificate. Zero tolerance for financial/row divergence.

### 10. `GovernanceSentinelAgent` (Stage 10: Govern)
- **Role:** Unified security, PII/PHI discovery, and compliance enforcer.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Cloud Data Loss Prevention (DLP), Dataplex Knowledge Catalog Policy Tags.
- **Responsibilities:** Identifies sensitive entities (SSN, credit cards, HIPAA patient data). Automatically applies Dataplex policy tags for column-level masking and row-level filtering across all query engines.

### 11. `LakehouseSREAgent` (Stage 11: Operate & Continuous Optimization)
- **Role:** Autonomic lakehouse health, compaction, and FinOps controller.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Iceberg metadata system tables (`$files`, `$snapshots`), Eventarc, Serverless Spark.
- **Responsibilities:** Continuously monitors for small-file accumulation and snapshot bloat. Evaluates FinOps ROI (Query scan savings > 2.5x compaction cost) before triggering `rewrite_data_files` bin-packing.

### 12. `TelemetryInsightsAgent` (Stage 12: Visualize)
- **Role:** Executive reporting, KPI telemetry, and conversational assistant.
- **Model:** Gemini 2.5 Flash.
- **Tools/APIs:** Cloud Monitoring API, Looker Studio embed, Slack/Teams webhooks.
- **Responsibilities:** Exposes real-time migration velocity, TCO savings, and query latency metrics. Answers natural-language operator inquiries grounded strictly in platform metadata.

---

## 4. The 10 Migration Strategies

The decision engine assigns each asset one of 10 discrete strategies:
1. `REGISTER`: Zero-copy metadata registration for existing cloud Parquet/ORC lakes.
2. `REPLICATE`: Direct parallel bulk copy for cold historical tables.
3. `CDC`: Continuous log-based replication via Datastream for live OLTP tables.
4. `TRANSFORM`: Structural transformation and code transpilation for legacy formats.
5. `REWRITE`: In-flight cleansing and sanitization for defective/corrupted data.
6. `REPARTITION`: Physical layout re-alignment to optimize BigQuery/Spark scan performance.
7. `AGGREGATE`: Micro-batch aggregation for ultra-high-volume raw sensor/telemetry logs.
8. `ARCHIVE`: Cold-storage tiering to GCS Archive for compliance-only historical data.
9. `VIRTUALIZE`: Zero-copy external federation via BigLake for restricted operational stores.
10. `EXCLUDE`: Explicit omission and retirement of dead/obsolete tables.

---

## 5. AgentGuard Action Firewall

All agent recommendations pass through **AgentGuard** before reaching the execution plane:

```
[Agent Proposed Action]
         │
         ▼
[AgentGuard Firewall]
  ├── 1. Syntax Check (Deny DROP, TRUNCATE, raw DELETE)
  ├── 2. Identity Check (Enforce short-lived Workload Identity)
  ├── 3. Risk Classification (LOW, MEDIUM, HIGH, CRITICAL)
  └── 4. DLP Policy Check (Block unauthorized PII access)
         │
         ▼
[Approval Gating]
  ├── LOW / MEDIUM: Auto-approved & logged to Cloud Audit
  └── HIGH / CRITICAL: Mandatory Human-in-the-Loop (HITL) Multi-Sig Approval
         │
         ▼
[Deterministic Cloud Execution]
```

---

## 6. Four-Tier Migration Proof Engine

To ensure mathematical certifiability:
- **Tier 1: Structural Proof:** SHA-256 schema fingerprint match (column ordinals, types, nullability).
- **Tier 2: Statistical Proof:** Pushdown HyperLogLog (HLL) cardinality, min/max boundaries, null/zero counts.
- **Tier 3: Cryptographic Proof:** In-engine partition-level commutative Merkle DAG hash check:
  $$\text{Hash}_{\text{block}} = \bigoplus_{i=1}^N \text{HMAC-SHA256}(\text{PK}_i \,\|\, \text{Col}_1 \,\|\, \dots \,\|\, \text{Col}_M)$$
- **Tier 4: Semantic Proof:** Autonomous execution of high-level business KPI rollups across source and target engines.

---

## 7. Schema Evolution & Self-Healing Execution

### Schema Drift Classification
- **`SAFE`:** Add nullable column or high-confidence semantic rename (>0.92 cosine similarity). Auto-applied via Iceberg metadata DDL without table rewrites.
- **`REQUIRES_REVIEW`:** Column type widening or complex struct addition. Generates impact analysis for architect review.
- **`BREAKING`:** Incompatible type narrowing or dropped mandatory column. Routes incoming rows to GCS quarantine and alerts operators.

### Bounded Autonomous Healing
When Spark jobs encounter failures (e.g., Executor OOM from data skew):
1. Agent parses driver error logs to identify root cause.
2. Formulates remediation (e.g., inject salting key, increase executor memory).
3. Verifies cost bounds within policy limit.
4. Executes bounded retry (Max 2 attempts). If failures persist, escalates immediately.

---

## 8. Development & Implementation Workflow

When implementing features within the NexusLake repository:
1. **Inspect:** Examine existing modules, interfaces, and configurations.
2. **Plan:** Outline files to create/modify, interfaces, and test scenarios.
3. **Implement:** Write minimal, testable, decoupled Python/Pydantic code.
4. **Test:** Execute pytest unit, integration, and agent assertion tests.
5. **Verify:** Confirm AgentGuard boundaries and zero-raw-data-egress compliance.
6. **Report:** Document implemented deliverables, test results, and next steps.

---

## 9. Reference Documents Map

For deep technical specifications, refer to:
- `references/architecture.md`: Four-Plane system topology and data flows.
- `references/data-model.md`: Canonical DataAsset and connector definitions.
- `references/migration-patterns.md`: The 10 strategies, wave planning, and transpiler.
- `references/agentguard.md`: Policy engine, risk classification, and HITL specifications.
- `references/proof-engine.md`: Mathematical formulations for the Four-Tier Proof Engine.
- `examples/migration-blueprint-example.yaml`: Declarative Migration-as-Code manifest.
