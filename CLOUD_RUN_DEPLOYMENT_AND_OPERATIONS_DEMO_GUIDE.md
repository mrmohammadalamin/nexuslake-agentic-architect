# NexusLake Agentic Architect — Google Cloud Run Deployment & Operations Demo Guide

### Complete Guide for 1-Command Cloud Run Deployment, Automatic Lifecycle Execution & Day-2 Operational Demos

> **Target Platform:** Google Cloud Run (Serverless Container Hosting)  
> **Google Cloud Services Used:** Cloud Run, Serverless Spark (Dataproc Serverless), Datastream, BigLake REST Catalog, Cloud Storage, Dataplex  

---

## 🚀 1. Google Cloud Run 1-Command Deployment Guide

Deploying NexusLake Agentic Architect on Google Cloud Run gives you a fully managed, serverless SSL URL accessible globally in under 2 minutes.

### Step 1: Authenticate with Google Cloud
Open your Command Prompt or PowerShell:

```powershell
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: 1-Command Build & Deploy to Google Cloud Run
Run the following single command from the project root directory:

```powershell
gcloud run deploy nexuslake-cockpit \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --port 8000
```

* **Cloud Run Production URL:** `https://nexuslake-cockpit-xxxxxxxx-uc.a.run.app/`
* **Swagger API Docs:** `https://nexuslake-cockpit-xxxxxxxx-uc.a.run.app/docs`

---

## ⚙️ 2. How NexusLake Automatically Works on Google Cloud Run

When hosted on Cloud Run, NexusLake operates as a **decoupled Control Plane**:

```
[User Browser / Cockpit UI]
            │
            ▼ (HTTPS / WSS)
[Google Cloud Run Container] ──► Gemini 2.5 Agents + AgentGuard Policy Firewall
            │
            ▼ (Private Service Connect / REST API)
[Customer Compute Tenant] ──► Serverless Spark + Datastream CDC + PyIceberg
            │
            ▼ (Zstandard Parquet Chunks)
[Google Cloud Storage] ──► Unified under BigLake Iceberg REST Catalog
```

1. **Automated Discovery**: Upon connecting any source DB (PostgreSQL, Oracle, Snowflake, MongoDB, S3/GCS), `EstateDiscoveryAgent` automatically crawls schemas, null rates, and PII tags without moving data.
2. **Automated Strategy Assignment**: `StrategyPlannerAgent` evaluates table churn and volume, assigning one of 10 strategies (`REGISTER`, `CDC`, `TRANSFORM`, etc.) and building topological wave DAGs.
3. **Automated Serverless Spark Dispatch**: One-click dispatches bulk load jobs to **Google Cloud Serverless Spark (Dataproc Serverless)**, auto-scaling from 10 to 2,000+ nodes.
4. **Automated Verification & Catalog Registration**: `ReconciliationProofAgent` calculates pushdown Merkle hashes ($\bigoplus \text{HMAC-SHA256}$) and registers Iceberg tables in the **BigLake REST Catalog**.

---

## 🛠️ 3. How to Show Live Operational Activities in Your Demo

During your video recording, highlight these **5 Day-2 Operational Activities**:

### Activity 1: Day-2 Lakehouse SRE Compaction & FinOps ROI Modeling
- **What to Show**: Click on **"Autonomic Day-2 SRE"** tab (View 6).
- **What Happens**: `LakehouseSREAgent` inspects physical Iceberg metadata files on GCS, detects 145 small files, and calculates the 30-day FinOps ROI:
  $$\text{ROI} = \frac{\text{BigQuery Slot Scan Savings (\$225.00)}}{\text{Spark Compaction Cost (\$2.50)}} = \mathbf{7.5\times \text{ ROI}}$$
- **Demo Highlight**: Show the automated `rewrite_data_files` bin-packing recommendation executed under AgentGuard policy bounds.

### Activity 2: AgentGuard Action Firewall Interception
- **What to Show**: Click on **"Database Sources"** tab (View 0). Type a destructive query like `DROP TABLE legacy_customers;` into the live SQL query console and click **"Run Query"**.
- **What Happens**: AgentGuard intercepts the query, evaluates syntactic safety rules, and returns a red **430 Forbidden** rejection:
  `[AgentGuard] Action REJECTED: Destructive command 'DROP TABLE' is blocked by policy.`
- **Demo Highlight**: Demonstrates that AI reasoning agents cannot execute destructive operations on production databases.

### Activity 3: Interactive Data Studio Cleansing & PII Tokenization
- **What to Show**: Click on **"Data Studio"** tab (View 1). Click **"Apply Advanced Cleansing"**.
- **What Happens**: Shows real-time whitespace trimming, null value imputation, Format-Preserving Encryption (FPE) tokenization (`4111-****-****-3333`), and fuzzy deduplication, upgrading the quality score from **78% to 99%**.

### Activity 4: Four-Tier Merkle Proof & GDPR Compliance Certificate
- **What to Show**: Click on **"Proof Engine"** tab (View 5). Click **"Audit Compliance (GDPR/HIPAA)"** and **"Generate Proof Certificate"**.
- **What Happens**: Shows 4-tier verification (Schema, Cardinality, Merkle DAG `0x8803...`, Statistical parity) alongside machine-verifiable digital compliance audit certificates.

### Activity 5: Conversational Estate Assistant Q&A
- **What to Show**: Click on **"Estate Assistant"** tab (View 7). Ask natural-language questions like:
  - *"Which datasets contain sensitive PII?"*
  - *"Why did transactions receive a CDC strategy?"*
- **What Happens**: Gemini 2.5 returns instant answers strictly grounded in canonical metadata graphs.

---

## 🎬 4. Cloud Run Demo Video Script (3:30 Minutes)

1. **Scene 1 (0:00 - 0:30)**: Show Cloud Run production URL `https://nexuslake-cockpit-uc.a.run.app`. Explain North Star & 12-stage modernization lifecycle.
2. **Scene 2 (0:30 - 1:00)**: Database Sources & AgentGuard firewall rejecting `DROP TABLE`.
3. **Scene 3 (1:00 - 2:00)**: Data Studio 4-step workflow (View, Visualize, Clean with FPE/fuzzy dedup, Customize Iceberg DDL).
4. **Scene 4 (2:00 - 2:30)**: Transpiler Studio (PL/SQL to PySpark + test synthesis) & 10-strategy wave planner.
5. **Scene 5 (2:30 - 3:00)**: Proof Engine 4-Tier Merkle DAG certificate + GDPR/HIPAA auditor.
6. **Scene 6 (3:00 - 3:30)**: Autonomic Day-2 SRE small-file compaction with 7.5x FinOps ROI modeling.
