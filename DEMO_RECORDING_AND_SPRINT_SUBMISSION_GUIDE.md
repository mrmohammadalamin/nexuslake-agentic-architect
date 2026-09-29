# NexusLake Agentic Architect — Demo Recording & Sprint Submission Guide
### Google Cloud Lakehouse / Apache Iceberg Content Sprint 2026

> **Target Audience:** Hackathon / Content Sprint Judges, Enterprise Architects & Google Cloud Partners  
> **Recommended Video Length:** 3 to 4 Minutes  

---

## 🎬 1. Pre-Demo Setup Checklist

Before pressing **Record**, make sure your local environment is running smoothly:

### Step 1: Launch the Platform Cockpit & Server
Open your PowerShell or Command Prompt terminal in the project root:

```powershell
python run_server.py
```
* **Cockpit UI URL:** [http://localhost:8000/](http://localhost:8000/)
* **OpenAPI Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 2: Test Real Data Ingestion (Warmup Script)
In a second terminal, verify physical PyIceberg file generation:

```powershell
python scripts/test_real_migration.py
```

### Step 3: Run Automated Test Suite
Confirm all 11 integration tests pass:

```powershell
python -m pytest tests/ -v
```

---

## 🎥 2. Recommended Screen Recording Settings

* **Recording Software:** OBS Studio, Loom, QuickTime, or Camtasia.
* **Browser Mode:** Full Screen mode (F11 or Cmd+Ctrl+F) at **1920x1080 (1080p)** resolution.
* **Audio:** Use a clear microphone with background noise suppression.
* **Zoom Level:** Browser at 100% or 110% for crisp UI readability.

---

## 📜 3. Step-by-Step Demo Video Script (3:30 Minutes)

### ⏱️ Scene 1: Executive Intro & Problem Statement (0:00 - 0:30)
* **What to Show:** Open [http://localhost:8000/](http://localhost:8000/) displaying the **NexusLake Agentic Architect** header and top navigation bar.
* **Voiceover Script:**
  > *"Welcome! Enterprise data migrations are notorious for high costs and high failure rates—over 70% stall due to legacy stored procedures, unindexed multimodal data, lock-in fears, and petabyte-scale verification challenges."*  
  > *"Meet **NexusLake Agentic Architect**—an AI-native modernization platform built on Google Cloud and Apache Iceberg v2. Through a 12-stage lifecycle powered by Gemini 2.5 agents and protected by the AgentGuard safety firewall, NexusLake transforms complex data estates into open, governed, and AI-ready lakehouses."*

---

### ⏱️ Scene 2: Universal Database Connectivity & AgentGuard Safety (0:30 - 1:00)
* **What to Show:** Click on **"Database Sources"** tab (View 0). Show pre-seeded connections for PostgreSQL, Oracle Exadata, Snowflake, MongoDB, and GCS Parquet. Click **"Test Connection"** on Oracle or Postgres.
* **Voiceover Script:**
  > *"Here in the Database Sources Cockpit, operators dynamically register any enterprise source—relational DBs, NoSQL collections, or legacy data lakes. Watch how we run an interactive SQL query: our AgentGuard Action Firewall intercepts every operation, deterministically blocking destructive commands like `DROP TABLE` while allowing safe metadata profiling."*

---

### ⏱️ Scene 3: Next-Gen Data Studio — View, Clean, Visualize & Customize (1:00 - 2:00)
* **What to Show:** Click on **"Data Studio"** tab (View 1).
  1. **Sub-Tab 1 (View)**: Show sample rows from PostgreSQL with messy untrimmed strings, null amounts, and card PAN PII.
  2. **Sub-Tab 2 (Visualize)**: Show null-rate percentage bars and categorical status/currency distribution charts.
  3. **Sub-Tab 3 (Clean)**: Click **"Apply & Preview Cleansing"** and **"Apply Advanced Cleansing"** to watch the Data Quality Score jump from **78% to 99%**, showing whitespace trimming, Dataplex PII masking (`4111-****-****-3333`), and fuzzy deduplication.
  4. **Sub-Tab 4 (Customize & Finalize)**: Select `days(created_at)` hidden partition transform, Z-ordering keys, view auto-generated BigLake Iceberg DDL, and click **"Finalize & Migrate"**.
* **Voiceover Script:**
  > *"Our Next-Gen Data Studio empowers operators to inspect raw records, visualize distribution histograms, and apply interactive sanitization. Notice how string trimming, null imputation, Format-Preserving Encryption, and fuzzy deduplication elevate our quality score from 78% to 99%. Under the hood, the Iceberg Layout Architect synthesizes optimal v2 table specs with hidden partitioning and Z-ordering before dispatching to Google Cloud Serverless Spark."*

---

### ⏱️ Scene 4: Transpiler Studio & Wave Planning (2:00 - 2:30)
* **What to Show:** Click on **"Transpiler Studio"** (View 4). Click **"Transpile Procedure to PySpark"**. Show the generated PySpark code and synthesized unit test fixtures.
* **Voiceover Script:**
  > *"To solve the legacy stored procedure nightmare, our `PipelineTranspilerAgent` deconstructs procedural PL/SQL and Teradata BTEQ scripts into PySpark DAGs while automatically synthesizing unit test assertion suites to guarantee 100% semantic equivalence."*

---

### ⏱️ Scene 5: 4-Tier Merkle Proof Engine & Compliance Auditor (2:30 - 3:00)
* **What to Show:** Click on **"Proof Engine"** (View 5). Click **"Audit Compliance (GDPR/HIPAA)"** and then click **"Generate Proof Certificate"**. Show the green Tier 1-4 green indicators and the `0x8803...` Merkle Hash.
* **Voiceover Script:**
  > *"How do we prove zero data loss over petabyte WAN migrations? Our `ReconciliationProofAgent` executes pushdown Commutative XOR Merkle Hashes ($\bigoplus \text{HMAC-SHA256}$). It cryptographically certifies zero lost or corrupted rows with zero network data egress, alongside 1-click GDPR and HIPAA compliance audit reports."*

---

### ⏱️ Scene 6: Day-2 Autonomic SRE & Wrap-Up (3:00 - 3:30)
* **What to Show:** Click on **"Autonomic Day-2 SRE"** (View 6). Show small-file fragmentation detection and the **7.5x ROI FinOps calculation**.
* **Voiceover Script:**
  > *"Finally, post-migration, our Day-2 `LakehouseSREAgent` continuously monitors small-file fragmentation and models FinOps ROI—executing automated Iceberg bin-packing only when query scan savings exceed compaction costs by 2.5x or more."*  
  > *"NexusLake Agentic Architect delivers an open, secure, and mathematically proven modernization lifecycle on Google Cloud. Thank you!"*

---

## 📤 4. Sprint Submission Package Requirements

When submitting to the Google Cloud Lakehouse / Iceberg Content Sprint, include:

1. **GitHub Repository Link**: Containing source code, [`README.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/README.md), [`REAL_DATA_MIGRATION_GUIDE.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/REAL_DATA_MIGRATION_GUIDE.md), and [`NEXUSLAKE_MASTER_PLATFORM_DOCUMENTATION.md`](file:///c:/Users/mrmoh/Desktop/data%20sprint/NEXUSLAKE_MASTER_PLATFORM_DOCUMENTATION.md).
2. **Video Demo Link**: YouTube (Unlisted/Public) or Loom recording (3–4 mins).
3. **Architecture Diagram**: Mermaid diagram from `README.md` or `NEXUSLAKE_MASTER_PLATFORM_DOCUMENTATION.md`.
4. **Key Google Technologies Used**:
   - Google Cloud Serverless Spark (Dataproc Serverless)
   - BigLake Iceberg REST Catalog
   - Google Cloud Datastream (Zero-Downtime CDC)
   - Google Cloud Storage (Apache Iceberg v2 Parquet)
   - Dataplex Knowledge Catalog (PII Policy Tags)
   - Vertex AI Multimodal Embeddings (`multimodalembedding@001`)
   - Gemini 2.5 Pro / Flash Reasoning Agents
