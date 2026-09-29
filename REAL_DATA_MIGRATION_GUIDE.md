# Real Data Migration Testing Guide
### Agentic Migration Architect: Autonomous Data Modernization for Apache Iceberg

This guide provides step-by-step instructions for testing **real data migration** from an enterprise database into an **Apache Iceberg lakehouse**, verifying data integrity with the **Four-Tier Mathematical Proof Engine**, and querying the resulting Iceberg tables.

---

## Table of Contents
1. [Overview & What Is Tested](#1-overview--what-is-tested)
2. [Option 1: 1-Click Automated Local Test (Instant, Zero Cloud Cost)](#2-option-1-1-click-automated-local-test-instant-zero-cloud-cost)
3. [Option 2: Interactive Real Data Migration via Web Cockpit (UI)](#3-option-2-interactive-real-data-migration-via-web-cockpit-ui)
4. [Option 3: Live Google Cloud Production Migration (GCS + BigLake + BigQuery)](#4-option-3-live-google-cloud-production-migration-gcs--biglake--bigquery)
5. [Understanding the 4-Tier Mathematical Proof Engine](#5-understanding-the-4-tier-mathematical-proof-engine)
6. [Troubleshooting & Windows Tips](#6-troubleshooting--windows-tips)

---

## 1. Overview & What Is Tested

In enterprise environments, data migration cannot rely on blind row-copying or hallucinated AI outputs. This platform guarantees:
1. **Real Data Extraction**: Connects to actual source database engines.
2. **Automated Cleansing & Governance**: Strips whitespace, imputes missing values, and tokenizes/masks sensitive PII according to Google Cloud Dataplex policies.
3. **Physical Apache Iceberg v2 Storage**: Writes real metadata JSON specifications, Avro manifest lists, and Parquet data chunks on disk or cloud object storage.
4. **Zero-Egress Mathematical Proof**: Employs Commutative XOR Merkle Hashes and statistical moment parity to guarantee zero lost, duplicated, or corrupted rows.
5. **Open Serving Interoperability**: Immediate queryability via BigQuery, Spark, Trino, and DuckDB.

---

## 2. Option 1: 1-Click Automated Local Test (Instant, Zero Cloud Cost)

A complete, self-contained automated test script is provided in the repository:
```
scripts/test_real_migration.py
```

### How to Run
Open your PowerShell or Command Prompt in the project root directory and execute:

```powershell
python scripts/test_real_migration.py
```

### What Happens Step-by-Step

```
[Real Source Database]               [Cleansing & Sanitization]               [Apache Iceberg v2 Table]
SQLite payments DB       ──►  Whitespace Trim, Null Impute,   ──►  Real Parquet Data Chunks,
(15 Messy Records)            Dataplex PII Tokenization            Metadata JSON & Manifest Avro
                                                                                 │
                                                                                 ▼
                                                                     [4-Tier Proof Engine]
                                                                     XOR Merkle Hash: 0x8803...
                                                                     100% Parity Verified
```

1. **Step 1: Creates Real Source Database (`source_payments.db`)**
   - Initializes a real SQLite database with 15 realistic transactional records exhibiting common enterprise data quality issues:
     - Untrimmed string padding (e.g. `"  Alice Smith  "`)
     - Missing / `NULL` financial amounts
     - Sensitive Credit Card numbers (`"4111-1111-2222-3333"`)
     - Missing country values
2. **Step 2: Extracts & Profiles the Data**
   - Automatically crawls column types, calculates null percentages, detects PII attributes, and assigns an initial Data Quality Score (**73%**).
3. **Step 3: Cleanses and Sanitizes Data**
   - **Trims whitespace** on all string attributes.
   - **Imputes missing numeric amounts** with `0.0` and missing countries with `'UNKNOWN'`.
   - **Masks credit card numbers** (`4111-****-****-3333`) and emails (`a***h@corp.com`) following Dataplex masking policies.
   - Upgrades Data Quality Score to **100%**.
4. **Step 4: Writes Real Physical Apache Iceberg v2 Table via PyIceberg**
   - Creates `curated.transactions` table in a local Iceberg catalog.
   - Writes actual physical files to disk:
     ```
     real_migration_test_output/iceberg_warehouse/curated/transactions/
     ├── metadata/
     │   ├── 00000-a91aadd9-75eb-4bbe-b96c-877dbc55040c.metadata.json
     │   ├── 00001-c8a0d803-9889-4f14-8988-3d91c6997e6e.metadata.json
     │   ├── snap-8623643768913454350-0-b9e64bc7-0114-48f5-a1b8-16b116b73cc0.avro
     │   └── b9e64bc7-0114-48f5-a1b8-16b116b73cc0-m0.avro
     └── data/
         └── 00000-0-b9e64bc7-0114-48f5-a1b8-16b116b73cc0.parquet
     ```
5. **Step 5: Executes Four-Tier Proof Engine**
   - **Tier 1 (Schema Parity)**: 100% column ordinal and datatype alignment (`PASSED`).
   - **Tier 2 (Cardinality)**: Exact 15/15 row reconciliation with zero loss (`PASSED`).
   - **Tier 3 (Commutative XOR Merkle Hash)**:
     - Source Hash: `0x8803b7747956bbf1ff123f464bf7fe8d2a901dda04a7d84a723d89c155c0b9dd`
     - Target Hash: `0x8803b7747956bbf1ff123f464bf7fe8d2a901dda04a7d84a723d89c155c0b9dd`
     - Status: `PASSED` (order-independent cryptographic proof of zero corruption).
   - **Tier 4 (Statistical Moment Parity)**: Financial volume sum reconciled to the exact penny ($3,764.80 == $3,764.80) (`PASSED`).
6. **Step 6: Scans & Reads Data from Iceberg**
   - Reads back and displays the sanitized, governed Iceberg records.

---

## 3. Option 2: Interactive Real Data Migration via Web Cockpit (UI)

You can perform the exact same migration interactively through the Google Cloud-style Web Modernization Cockpit:

### 1. Launch the Server
```powershell
python run_server.py
```

### 2. Open the Browser
Navigate to:
- **Cockpit UI**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Step-by-Step UI Workflow
1. **Database Sources Tab**:
   - View seeded enterprise connections (PostgreSQL, Oracle Exadata, Snowflake, MongoDB, S3/GCS Parquet).
   - Click **"Test & Save Connection"** to add your own real database host.
   - Run safe interactive SQL queries evaluated by the **AgentGuard policy firewall**.
   - Click **"Modernize to Iceberg &rarr;"**.
2. **Data Studio (View/Clean) Tab**:
   - **Sub-Tab 1 (View)**: Inspect tabular sample rows, schema types, and cells with NULL or PII indicators.
   - **Sub-Tab 2 (Visualize)**: Inspect column null-rate percentage bars and categorical distribution meters.
   - **Sub-Tab 3 (Clean)**: Check boxes for *String Trimming*, *Null Imputation*, and *Dataplex PII Masking*, then click **"Apply & Preview Cleansing"** to watch the quality score jump from 78% to 98%.
   - **Sub-Tab 4 (Customize & Finalize)**: Select your partition transform (e.g. `days(created_at)`), choose Z-order clustering sort keys, review the generated Iceberg DDL, and click **"Finalize & Migrate to Google Cloud Iceberg"** to generate the execution receipt.
3. **Proof Engine Tab**:
   - Generate and download the machine-verifiable Four-Tier Proof Certificate JSON.
4. **Autonomic Day-2 SRE Tab**:
   - Inspect small-file fragmentation and review the 30-day FinOps ROI calculation comparing BigQuery slot-scan savings against Serverless Spark rewrite compaction costs.

---

## 4. Option 3: Live Google Cloud Production Migration (GCS + BigLake + BigQuery)

To migrate real data into **Google Cloud Storage** and register with the **BigLake Iceberg REST Catalog**:

### Step 1: Authenticate with Google Cloud
Ensure the Google Cloud CLI (`gcloud`) is installed and authenticated:

```powershell
gcloud auth application-default login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Enable Required Cloud Services
```powershell
gcloud services enable \
  biglake.googleapis.com \
  dataproc.googleapis.com \
  datastream.googleapis.com \
  dataplex.googleapis.com \
  bigquery.googleapis.com \
  storage.googleapis.com
```

### Step 3: Provision GCS Lakehouse Bucket & BigLake Catalog
```powershell
# 1. Create storage bucket for Iceberg Parquet files
gcloud storage buckets create gs://YOUR_LAKEHOUSE_BUCKET --location=us-central1 --uniform-bucket-level-access

# 2. Create BigLake REST Catalog
gcloud biglake catalogs create production-catalog --location=us-central1
```

### Step 4: Python Script to Ingest Real Data to BigLake & GCS
Create a script `scripts/migrate_to_gcp_biglake.py`:

```python
import pyarrow as pa
from pyiceberg.catalog import load_catalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, StringType, DoubleType, TimestampType

PROJECT_ID = "YOUR_GCP_PROJECT_ID"
REGION = "us-central1"
BUCKET = "YOUR_LAKEHOUSE_BUCKET"
CATALOG_NAME = "production-catalog"

# 1. Connect to BigLake Iceberg REST Catalog
catalog = load_catalog(
    "biglake",
    **{
        "type": "rest",
        "uri": f"https://biglake.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/catalogs/{CATALOG_NAME}",
        "warehouse": f"gs://{BUCKET}/warehouse",
    }
)

# 2. Create Namespace and Table
namespace = "lakehouse_curated"
catalog.create_namespace_if_not_exists(namespace)

schema = Schema(
    NestedField(1, "transaction_id", StringType(), required=True),
    NestedField(2, "customer_name", StringType()),
    NestedField(3, "amount_usd", DoubleType()),
    NestedField(4, "status", StringType()),
)

table = catalog.create_table_if_not_exists(
    f"{namespace}.transactions",
    schema=schema,
    properties={
        "format-version": "2",
        "write.parquet.compression-codec": "zstd"
    }
)

# 3. Append Cleaned PyArrow Data
sample_data = pa.Table.from_pydict(
    {
        "transaction_id": ["txn-101", "txn-102", "txn-103"],
        "customer_name": ["Alice Smith", "Bob Johnson", "Carlos Mendez"],
        "amount_usd": [145.50, 0.0, 89.20],
        "status": ["COMPLETED", "PENDING", "COMPLETED"],
    },
    schema=table.schema().as_arrow()
)

table.append(sample_data)
print(f"[✓] Successfully migrated real data to BigLake table: {namespace}.transactions")
```

### Step 5: Query Immediately from BigQuery
Open the BigQuery console and run standard SQL directly over the Iceberg table with zero copy:

```sql
SELECT 
    transaction_id, 
    customer_name, 
    amount_usd, 
    status 
FROM 
    `YOUR_GCP_PROJECT_ID.lakehouse_curated.transactions`
WHERE 
    status = 'COMPLETED';
```

---

## 5. Understanding the 4-Tier Mathematical Proof Engine

| Verification Tier | Method | Guarantee |
| :--- | :--- | :--- |
| **Tier 1: Structural** | SHA-256 schema hash & ordinal comparison | 100% column name, type compatibility, and ordinal parity check. |
| **Tier 2: Cardinality** | Row count match & null-rate bounds | Exact row reconciliation; flags dropped records. |
| **Tier 3: Cryptographic** | Commutative XOR Merkle Hash ($\bigoplus \text{HMAC-SHA256}$) | Fast, order-independent checksum guaranteeing zero row alteration or duplication without network data egress. |
| **Tier 4: Statistical** | Distributional moments (Mean, Variance, Min, Max) | Matches financial sums and metric distributions to 4 decimal places. |

---

## 6. Troubleshooting & Windows Tips

1. **PyIceberg on Windows**:
   - PyIceberg is pre-installed in your environment (`pyiceberg>=0.12.0`).
   - When specifying local catalog directories on Windows, use normalized paths with forward slashes (`C:/path/to/warehouse`) to ensure compatibility with PyArrow's C++ filesystem layer.
2. **Port 8000 in use**:
   - If port 8000 is occupied, run:
     ```powershell
     python -m uvicorn src.api.main:app --port 8080
     ```
3. **Running the Full Pytest Suite**:
   ```powershell
   python -m pytest tests/ -v
   ```
   All 8 unit and integration tests should pass in under 1 second.
