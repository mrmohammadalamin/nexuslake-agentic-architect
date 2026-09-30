# NexusLake Agentic Architect: Autonomous Data Modernization for Apache Iceberg
### AI-Native Enterprise Data Estate Modernization Platform on Google Cloud

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Apache Iceberg](https://img.shields.io/badge/lakehouse-Apache%20Iceberg%20v2-cyan.svg)](https://iceberg.apache.org/)
[![Google Cloud](https://img.shields.io/badge/target-Google%20Cloud-yellow.svg)](https://cloud.google.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## 📸 Platform Architecture & Production Screenshots

![NexusLake Platform Architecture Infographic](assets/nexuslake_architecture_infographic.jpg)

### 🖥️ Modernization Cockpit Views

| View | Screenshot Demo | Operational Purpose |
| :--- | :--- | :--- |
| **0. Database Sources** | ![Database Sources Cockpit](assets/home.png) | Universal connection manager for PostgreSQL, Oracle Exadata, Snowflake, MongoDB, and S3/GCS. Includes AgentGuard live query console. |
| **1. Estate Discovery** | ![Estate Discovery Profiling](assets/estate_discovery.png) | Automated profiling of heterogeneous sources, generating canonical `DataAsset` graphs and Dataplex PII tags. |
| **2. Data Studio** | ![Next-Gen Data Studio](assets/data_cleaning.png) | 4-step workflow: View data, visualize distributions, apply interactive cleansing (whitespace trim, null impute, Dataplex PII mask, FPE tokenization, fuzzy dedup). |
| **3. Wave Planner** | ![Wave Planner Topological DAG](assets/wave_planner_dag.png) | 10-strategy assignment engine and topological wave dependency DAG (Wave 1 Dimensions $\rightarrow$ Wave 2 Facts $\rightarrow$ Wave 3 Marts). |
| **4. Transpiler Studio** | ![Transpiler Studio](assets/transpiler_studio.png) | Modernizes legacy procedural PL/SQL and BTEQ scripts into PySpark DAGs with synthesized automated unit test suites. |
| **5. Iceberg Finalizer** | ![Iceberg Layout Customizer](assets/finalizing_iceberg.png) | Customizes target Iceberg v2 hidden partitions (`days`), Z-ordering keys, target Parquet file sizes, and generates BigLake DDL. |
| **6. Proof Engine** | ![Proof Engine Dashboard](assets/proof_engine_dashboard.png) | Four-Tier Mathematical Verification asserting zero data loss via Commutative XOR Merkle Hash (`0x8803...`) and digital GDPR/HIPAA audit reports. |

> 🎥 **Recorded Demo Video Available**: Full video walkthrough recorded and available at [`Recording 2026-09-30 034139.mp4`](Recording%202026-09-30%20034139.mp4) for Sprint submission.

---

## 📌 Executive Summary & Product North Star

**NexusLake Agentic Architect** (Agentic Migration Architect) is an AI-native enterprise data modernization platform designed to transform heterogeneous, legacy data estates (RDBMS, data warehouses, NoSQL, files, streaming CDC, audio, video, images, graphs, vector embeddings, spatial GIS, and scientific formats) at **petabyte scale (100+ TB / 1 Trillion+ rows)** into an open, governed, and AI-ready **Apache Iceberg v2 lakehouse on Google Cloud**.

### Product North Star
> *"NexusLake Agentic Architect transforms complex enterprise data estates into an open, governed, AI-ready Apache Iceberg v2 lakehouse on Google Cloud—and continuously modernizes, heals, and optimizes it for production workloads."*

### Core Architectural Axioms
1. **Gemini 2.5 Pro/Flash & Reasoning Layer**: LLMs act strictly as the reasoning, semantic translation, planning, and root-cause analysis layer.
2. **Deterministic Compute Layer**: Google Cloud Serverless Spark, Datastream CDC, Dataflow, and PyIceberg execute all bulk data movement, transformations, and mathematical verifications.
3. **Three Safety Rules**:
   - LLMs **NEVER** move raw bulk data rows.
   - LLMs **NEVER** execute destructive SQL (`DROP TABLE`, `TRUNCATE`) without deterministic policy gating ([`AgentGuard`](file:///c:/Users/mrmoh/Desktop/data%20sprint/src/policies/agent_guard.py)).
   - LLMs **NEVER** handle raw production credentials directly (managed via Secret Manager & Workload Identity Federation).

---

## 🏗️ End-to-End System Architecture Diagram

```mermaid
flowchart TD
    subgraph EnterpriseSources["1. Heterogeneous Enterprise Data Estate (Multi-Cloud / On-Prem)"]
        PG["PostgreSQL / MySQL (OLTP)"]
        ORA["Oracle Exadata / RAC"]
        MSSQL["Microsoft SQL Server"]
        SNOW["Snowflake Enterprise DW"]
        MONGO["MongoDB (JSON Collections)"]
        S3["AWS S3 / GCS Data Lake (Parquet/ORC)"]
        MEDIA["Unstructured Media (Audio, Video, Images, PDFs)"]
    end

    subgraph IntelligencePlane["2. Data Intelligence Plane (Customer VPC Perimeter)"]
        CONN["Universal Dynamic Connection Manager"]
        GRAPH["Canonical DataAsset Knowledge Graph"]
        STUDIO["Next-Gen Data Studio (View, Visualize, Clean, Customize)"]
        PROOF["4-Tier Mathematical Merkle Proof Engine"]
    end

    subgraph ControlPlane["3. Agentic Control Plane (Managed SaaS / Cloud Run)"]
        UI["NexusLake Modernization Cockpit SPA"]
        GUARD["AgentGuard Policy Firewall (Syntactic, IAM & DLP Gates)"]
        AGENTS["14 Specialized Gemini 2.5 Agents Roster"]
        MAC["Migration-as-Code Compiler (Declarative Blueprints)"]
    end

    subgraph ExecutionPlane["4. Deterministic Cloud Execution Plane (Customer Compute)"]
        SPARK["Google Cloud Serverless Spark (Batch Load & Transpiled DAGs)"]
        STREAM["Google Cloud Datastream (Zero-Downtime CDC Stream)"]
        VEC["In-Flight Multimodal Vectorizer (Vertex AI Embeddings)"]
        CLEANSE["Cleansing Engine (Fuzzy Dedup & FPE Tokenization)"]
    end

    subgraph GovernedLakehouse["5. Governed Open Lakehouse Plane (Google Cloud Storage)"]
        GCS["Apache Iceberg v2 Parquet Tables (GCS)"]
        REST["BigLake Iceberg REST Catalog"]
        DATAPLEX["Dataplex Knowledge Catalog (PII Policy Tags)"]
        ENGINES["Multi-Engine Access (BigQuery | Spark | Trino | Vertex AI)"]
    end

    EnterpriseSources --> CONN
    CONN --> GRAPH
    GRAPH --> STUDIO
    STUDIO --> GUARD
    UI <--> GUARD
    GUARD <--> AGENTS
    AGENTS --> MAC
    MAC --> GUARD
    GUARD --> SPARK
    GUARD --> STREAM

    CONN --> CLEANSE
    CLEANSE --> SPARK
    CONN --> VEC
    VEC --> GCS
    SPARK --> GCS
    STREAM --> GCS

    GCS <--> REST
    REST <--> DATAPLEX
    REST --> ENGINES
    GCS --> ENGINES
    ENGINES -.->|Pushdown HLL & XOR Hashes| PROOF
```

---

## 🧠 Platform Mindmap

```mermaid
mindmap
  root((NexusLake Agentic Architect))
    Four-Plane System Architecture
      Agentic Control Plane
        Gemini 2.5 Pro and Flash
        AgentGuard Safety Firewall
        Migration-as-Code Compiler
      Data Intelligence Plane
        Universal Connector Layer
        DataAsset Knowledge Graph
        4-Tier Proof Engine
      Deterministic Execution Plane
        Serverless Spark
        Datastream CDC
        Vertex AI Multimodal Vectorizer
      Governed Lakehouse Plane
        Apache Iceberg v2 on GCS
        BigLake REST Catalog
        Dataplex Policy Tags
        Multi-Engine Serving
    The 12-Stage Lifecycle
      Discover
      Assess
      Understand
      Decide
      Design
      Clean
      Transform
      Migrate
      Validate
      Govern
      Operate
      Visualize
    The 14 Specialized Agents
      EstateDiscoveryAgent
      ComplexityAssessmentAgent
      SemanticOntologyAgent
      StrategyPlannerAgent
      IcebergLayoutArchitect
      DataHygieneAgent
      PipelineTranspilerAgent
      MigrationOrchestratorAgent
      ReconciliationProofAgent
      GovernanceSentinelAgent
      LakehouseSREAgent
      TelemetryInsightsAgent
      MultimodalVectorizerAgent
      SecurityComplianceAgent
    Advanced Features
      Fuzzy Deduplication
      Format-Preserving Encryption
      Custom Regex Transformers
      GDPR and HIPAA Audit Certificates
      Petabyte 100+ TB Scale
      Dual-Speed CDC Cutover
```

---

## 🔄 The 12-Stage Modernization Lifecycle

$$\text{Discover} \rightarrow \text{Assess} \rightarrow \text{Understand} \rightarrow \text{Decide} \rightarrow \text{Design} \rightarrow \text{Clean} \rightarrow \text{Transform} \rightarrow \text{Migrate} \rightarrow \text{Validate} \rightarrow \text{Govern} \rightarrow \text{Operate} \rightarrow \text{Visualize}$$

| Stage | Name | Key Agent / Technology | Description |
| :---: | :--- | :--- | :--- |
| **1** | **Discover** | `EstateDiscoveryAgent` | Crawls heterogeneous source databases, schemas, catalogs, and metadata. |
| **2** | **Assess** | `ComplexityAssessmentAgent` | Analyzes volume, query QPS, null rates, complexity score (1-100), and 3-year TCO. |
| **3** | **Understand** | `SemanticOntologyAgent` | Resolves cryptic column/table names, infers entity graphs, and identifies PII/PHI. |
| **4** | **Decide** | `StrategyPlannerAgent` | Assigns optimal migration paths from 10 strategies & builds wave DAGs. |
| **5** | **Design** | `IcebergLayoutArchitect` | Synthesizes target Iceberg v2 hidden partition transforms (`days`, `hours`) & Z-ordering. |
| **6** | **Clean** | `DataHygieneAgent` | Interactive whitespace trimming, null imputation, Dataplex PII masking & fuzzy dedup. |
| **7** | **Transform** | `PipelineTranspilerAgent` | Transpiles legacy stored procedures (PL/SQL, BTEQ) to PySpark + test synthesis. |
| **8** | **Migrate** | `MigrationOrchestratorAgent` | Executes Serverless Spark batch loads & Datastream zero-downtime CDC ingestion. |
| **9** | **Validate** | `ReconciliationProofAgent` | Mathematically proves zero data loss via 4-tier Commutative XOR Merkle DAG. |
| **10** | **Govern** | `GovernanceSentinelAgent` | Applies Cloud DLP scans, Dataplex policy tags, and column/row masking rules. |
| **11** | **Operate** | `LakehouseSREAgent` | Autonomic Day-2 small-file bin-packing compaction with 7.5x FinOps ROI modeling. |
| **12** | **Visualize** | `TelemetryInsightsAgent` | Interactive migration Cockpit UI dashboards and natural-language Q&A assistant. |

---

## 🤖 The 14 Specialized Agents & Working Workflows

### Agent Roster Matrix

| Stage | Agent Name | Gemini Model | Responsibilities & Focus | Safety Policy Gate |
| :---: | :--- | :---: | :--- | :---: |
| **1** | **`EstateDiscoveryAgent`** | 2.5 Flash | Deep crawler of source databases, schemas, tables, partition specs, table sizes, update frequencies, and PII attributes. Emits `DataAsset` graph. | Autonomous |
| **2** | **`ComplexityAssessmentAgent`** | 2.5 Flash | Evaluates query concurrency, compute footprints, WAN egress constraints; calculates Complexity Score (1–100) and 3-year TCO comparison. | Advisory |
| **3** | **`SemanticOntologyAgent`** | 2.5 Pro | Disambiguates cryptic table/column naming (e.g., `TXN_AMT_LCL` $\rightarrow$ `transaction_amount_local_currency`), maps entities to business domains, and infers lineage graphs. | Review |
| **4** | **`StrategyPlannerAgent`** | 2.5 Pro | Assigns assets one of 10 strategies (`REGISTER`, `CDC`, `TRANSFORM`, `REPARTITION`, etc.) and builds a topological wave dependency DAG. | **Mandatory Architect Sign-Off** |
| **5** | **`IcebergLayoutArchitect`** | 2.5 Flash | Designs optimal physical Iceberg v2 table specs: hidden partitioning (e.g., `days(event_time)`), Z-Ordering sort keys, 256 MB Parquet file targets, and Puffin stats. | Layout Approval |
| **6** | **`DataHygieneAgent`** | 2.5 Flash | Detects null violations, corrupted records, and untrimmed strings. Imputes missing fields deterministically or routes irrecoverable rows to GCS quarantine buckets. | Quarantine Review |
| **7** | **`PipelineTranspilerAgent`** | 2.5 Pro | Deconstructs legacy procedural SQL (PL/SQL, BTEQ, T-SQL) into PySpark DAGs and Spark SQL. Synthesizes automated unit test suites with reflection loops. | **Equivalence Test Sign-Off** |
| **8** | **`MigrationOrchestratorAgent`** | 2.5 Flash | Orchestrates historical bulk loads via Serverless Spark and configures Datastream CDC pipelines until lag is under 2 seconds. | **Mandatory Cutover Sign-Off** |
| **9** | **`ReconciliationProofAgent`** | 2.5 Flash | Executes 4-tier Merkle DAG and statistical proof engine. Emits machine-verifiable JSON Proof Certificates with zero tolerance for row or financial divergence. | Zero-Tolerance Gate |
| **10**| **`GovernanceSentinelAgent`** | 2.5 Flash | Scans sensitive PII/PHI (SSN, credit card, HIPAA) and applies Dataplex Knowledge Catalog policy tags for column-level masking and row-level filtering. | Security Review |
| **11**| **`LakehouseSREAgent`** | 2.5 Flash | Autonomic Day-2 controller that continuously monitors small-file accumulation and snapshot bloat. Triggers `rewrite_data_files` bin-packing when ROI $\ge 2.5\times$. | Autonomous / Alerted |
| **12**| **`TelemetryInsightsAgent`** | 2.5 Flash | Conversational assistant grounding natural language answers strictly in platform metadata, exposing real-time migration velocity and cost savings KPIs. | Auto-Refreshed |
| **+** | **`MultimodalVectorizerAgent`** | 2.5 Flash | Processes unstructured media (audio, video, images, PDFs), generating OCR, transcripts, visual features, and $768d/1536d$ vector embeddings into Iceberg tables. | Autonomous |
| **+** | **`SecurityComplianceAgent`** | 2.5 Flash | Manages Format-Preserving Encryption (FPE), Cloud DLP tokenization, Dataplex Policy Tag mapping (RLS/CLS), and 1-click Compliance Audit Certificates (GDPR, HIPAA, SOC 2, PCI-DSS). | Security Review |

---

### Agent Activity Workflows

#### Flow 1: Stages 1–4 (Discover, Assess, Understand, Decide)

```mermaid
flowchart LR
    subgraph Discovery["Stage 1: Discover"]
        A1["EstateDiscoveryAgent (Gemini Flash)"] -->|Crawls Schemas & Metrics| G1["Canonical DataAsset Graph"]
    end

    subgraph Assessment["Stage 2: Assess"]
        G1 --> A2["ComplexityAssessmentAgent (Gemini Flash)"]
        A2 -->|Calculates TCO & Score| S2["Complexity Score & WAN Estimates"]
    end

    subgraph Understanding["Stage 3: Understand"]
        S2 --> A3["SemanticOntologyAgent (Gemini Pro)"]
        A3 -->|Resolves Cryptic Names| M3["Business Entity Glossary & Lineage"]
    end

    subgraph Decision["Stage 4: Decide"]
        M3 --> A4["StrategyPlannerAgent (Gemini Pro)"]
        A4 -->|Assigns 10 Strategies| DAG4["Topological Wave Plan DAG"]
        DAG4 -->|Policy Check| GATE4["MANDATORY ARCHITECT SIGN-OFF"]
    end
```

#### Flow 2: Stages 5–7 (Design, Clean, Transform)

```mermaid
flowchart LR
    subgraph Design["Stage 5: Design"]
        A5["IcebergLayoutArchitect (Gemini Flash)"] -->|Hidden Partitioning & Z-Ordering| DDL5["Iceberg v2 Table Spec & DDL"]
    end

    subgraph Clean["Stage 6: Clean"]
        DDL5 --> A6["DataHygieneAgent & Cleansing Engine"]
        A6 -->|Trims, Imputes, FPE & Fuzzy Dedup| C6["Sanitized Data (99% Quality Score)"]
    end

    subgraph Transform["Stage 7: Transform"]
        C6 --> A7["PipelineTranspilerAgent (Gemini Pro)"]
        A7 -->|AST Transpilation| SPARK7["PySpark DAG Code"]
        A7 -->|Synthesizes Fixtures| TEST7["Automated Pytest Assertions"]
    end
```

#### Flow 3: Stages 8–10 (Migrate, Validate, Govern)

```mermaid
flowchart LR
    subgraph Migrate["Stage 8: Migrate"]
        A8["MigrationOrchestratorAgent (Gemini Flash)"] -->|Dispatches Batch & CDC| SPARK8["Serverless Spark & Datastream"]
        SPARK8 -->|Writes 256MB Parquet| GCS8["Apache Iceberg v2 on GCS"]
    end

    subgraph Validate["Stage 9: Validate"]
        GCS8 --> A9["ReconciliationProofAgent (Gemini Flash)"]
        A9 -->|Computes Pushdown XOR Merkle Hash| PROOF9["4-Tier Proof Certificate JSON"]
    end

    subgraph Govern["Stage 10: Govern"]
        PROOF9 --> A10["GovernanceSentinelAgent (Gemini Flash)"]
        A10 -->|Applies Dataplex Policy Tags| TAGS10["Column Masking & RLS Policies"]
    end
```

---

## 🗂️ Universal Data Format Taxonomy

| Format Family | Source Formats | Conversion & Ingestion Mechanism | Target Apache Iceberg v2 Format |
| :--- | :--- | :--- | :--- |
| **Relational & Warehouses** | PostgreSQL, Oracle, DB2, SQL Server, Teradata, Snowflake | Parallel JDBC bulk extraction via Serverless Spark; automatic data type translation (`NUMERIC` $\rightarrow$ `decimal`, `TIMESTAMPTZ` $\rightarrow$ `timestamp_tz`). | Strongly typed Parquet data files. |
| **Semi-Structured & NoSQL** | JSON, XML, BSON (MongoDB), DynamoDB, Cassandra | Automatic unnesting of nested documents into Iceberg `struct`, `list`, and `map` types; dynamic schema widening without table rewrites. | Iceberg v2 Nested Struct Parquet. |
| **Columnar & Data Lakes** | Parquet, ORC, Avro, Arrow | **Zero-Copy Metadata Registration (`REGISTER` Strategy)**: Registers pointers in BigLake REST Catalog without copying bytes. | In-place Iceberg Metadata pointers. |
| **Streaming CDC & IoT** | Kafka, Pub/Sub, Datastream, Debezium, MQTT | Real-time micro-batch ingestion into Iceberg Merge-on-Read (MoR) tables with low-latency CDC updates. | Iceberg `.delete.parquet` + Parquet chunks. |
| **Spatial & GIS** | GeoJSON, Shapefiles, WKT, WKB, GeoParquet, PostGIS | Converted into GeoParquet or WKB spatial geometry columns queryable via BigQuery GIS (`ST_CONTAINS`, `ST_DISTANCE`). | GeoParquet / WKB Geometry columns. |
| **Unstructured Media** | Audio (MP3/WAV), Video (MP4), Images (JPEG/PNG/DICOM), PDF/DOCX | `MultimodalVectorizerAgent` runs Vertex AI models (`multimodalembedding@001`) to extract OCR, transcripts, and embeddings. | Iceberg metadata + GCS object links. |
| **AI Vector Embeddings** | 768d/1536d Float Arrays (Vertex AI, OpenAI, FAISS) | Stored as fixed-size float array columns (`list<float>`); registered with BigQuery Vector Search & Vertex AI Vector Search. | Iceberg Float Array Parquet columns. |
| **Graph Networks** | Neo4j Cypher, AWS Neptune, GraphML, RDF | Extracted into standardized **Nodes** and **Edges** Parquet tables, queryable via SQL/PGQ standards. | Nodes & Edges Iceberg tables. |

---

## 🛡️ AgentGuard Policy Firewall

All agent recommendations pass through **AgentGuard** before reaching the execution plane:

```
[Agent Action Proposal]
          │
          ▼
[AgentGuard Firewall]
  ├── 1. Syntactic Inspection (Deny DROP, TRUNCATE, raw DELETE)
  ├── 2. IAM & Workload Identity Assertion (Verify ephemeral token)
  ├── 3. Data Classification Check (Enforce Dataplex policy tag masking)
  └── 4. Risk Classification Tiering
          │
          ├─► LOW (Profiling, dry runs, ROI compaction) ──► Autonomous Execution
          ├─► MEDIUM (Staging bucket creation)          ──► Autonomous + Webhook Alert
          ├─► HIGH (Column renames, transpiled DAGs)     ──► Mandatory 1 Human Sign-Off
          └─► CRITICAL (Cutover, legacy stop)           ──► Mandatory Multi-Sig Sign-Off
```

---

## 🧮 Four-Tier Migration Proof Engine

To ensure mathematical certifiability without WAN data movement:
- **Tier 1 (Structural):** SHA-256 schema fingerprinting (types, ordinals, nullability).
- **Tier 2 (Statistical):** Pushdown HyperLogLog (HLL) cardinality & min/max bounds.
- **Tier 3 (Cryptographic):** In-engine partition-level Commutative XOR Merkle DAG hash check:
  $$\text{Hash}_{\text{block}} = \bigoplus_{i=1}^N \text{HMAC-SHA256}(\text{PK}_i \,\|\, \text{Col}_1 \,\|\, \dots \,\|\, \text{Col}_M)$$
- **Tier 4 (Semantic):** Autonomous execution of business KPI rollups diffed across source and target engines.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
* Python 3.11+
* Node.js 18+

### 1. Launch Platform Cockpit (FastAPI + React SPA)
```bash
python run_server.py
```
* **Cockpit UI URL:** [http://localhost:8000/](http://localhost:8000/)
* **OpenAPI Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run Real Data Migration Test (Physical PyIceberg Generation)
```bash
python scripts/test_real_migration.py
```

### 3. Run Automated Integration Test Suite
```bash
python -m pytest tests/ -v
```

---

## ☁️ Google Cloud Run Deployment

Deploy to Google Cloud Run in under 2 minutes:

```bash
gcloud run deploy nexuslake-cockpit \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --port 8000
```

---

## 📄 Key Project Documentation Files

- **[`NEXUSLAKE_MASTER_PLATFORM_DOCUMENTATION.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/NEXUSLAKE_MASTER_PLATFORM_DOCUMENTATION.md)** — Master documentation & architectural reference.
- **[`PLATFORM_ARCHITECTURE_DIAGRAMS_AND_MINDMAP.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/PLATFORM_ARCHITECTURE_DIAGRAMS_AND_MINDMAP.md)** — System diagrams, mindmaps, and agent flowcharts.
- **[`DEMO_RECORDING_AND_SPRINT_SUBMISSION_GUIDE.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/DEMO_RECORDING_AND_SPRINT_SUBMISSION_GUIDE.md)** — Video demo script and competition submission package guide.
- **[`REAL_DATA_MIGRATION_GUIDE.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/REAL_DATA_MIGRATION_GUIDE.md)** — Step-by-step real database ingestion guide.
- **[`CLOUD_RUN_DEPLOYMENT_AND_OPERATIONS_DEMO_GUIDE.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/CLOUD_RUN_DEPLOYMENT_AND_OPERATIONS_DEMO_GUIDE.md)** — Cloud Run deployment & 5 Day-2 operational activities.

---

## 📄 License

Apache License 2.0. See [LICENSE](LICENSE) for details.
