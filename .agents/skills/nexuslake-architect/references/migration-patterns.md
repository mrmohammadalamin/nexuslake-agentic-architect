# NexusLake Migration Patterns Reference: Strategies, Wave Planning & Transpilation

This document details the 10 migration strategies, the topological wave planning algorithm, and the procedural code transpilation engine.

---

## 1. The 10 Migration Strategies

NexusLake rejects simple brute-force data dumping. The Strategy Agent evaluates 12 asset characteristics to assign one of 10 discrete patterns:

```
                                  [DataAsset Evaluated]
                                            │
               ┌────────────────────────────┼───────────────────────────┐
               ▼                            ▼                           ▼
       [Data in Cloud S3/GCS]      [Live Operational OLTP]      [Cold Historical]
               │                            │                           │
         Is it Parquet/ORC?          High Write Churn?          Quality Issues?
         ├── Yes: REGISTER            ├── Yes: CDC               ├── Yes: REWRITE
         └── No:  TRANSFORM           └── No:  REPLICATE         └── No:  REPARTITION
```

### Strategy Catalog

1. **`REGISTER` (Zero-Copy Catalog Mapping)**
   - *Target:* Existing Parquet/ORC lakes on Cloud Storage or AWS S3.
   - *Action:* BigLake Iceberg REST Catalog registers the external URI without copying data.
2. **`REPLICATE` (Bulk Direct Batch Load)**
   - *Target:* Immutable historical tables, static dimensional data.
   - *Action:* Serverless Spark parallel JDBC scan directly to Apache Iceberg v2 Parquet files.
3. **`CDC` (Continuous Change Data Capture)**
   - *Target:* High-churn operational relational tables ($>50\text{ writes/sec}$).
   - *Action:* Google Cloud Datastream log-based mining writes to BigQuery/Iceberg using merge-on-read equality deletes.
4. **`TRANSFORM` (Structural & Dialect Transformation)**
   - *Target:* Complex nested JSON, non-standard timestamp encodings, or legacy proprietary types.
   - *Action:* Transpiled PySpark DAGs running on Serverless Spark.
5. **`REWRITE` (Data Hygiene & Sanitization)**
   - *Target:* Tables with poor quality scores ($>5\%$ corrupted records or broken candidate keys).
   - *Action:* Data cleansing pipeline applies heuristics, imputes defaults, and routes anomalies to GCS quarantine.
6. **`REPARTITION` (Physical Layout Re-engineering)**
   - *Target:* Tables with historical partition skew (e.g., millions of tiny date folders).
   - *Action:* Restructures to Iceberg hidden partition transforms (`days(ts)`, `bucket(100, id)`).
7. **`AGGREGATE` (Micro-Batch Rollup)**
   - *Target:* High-velocity raw telemetry or clickstreams where users only query summaries.
   - *Action:* Serverless Spark continuous window aggregations to an aggregated Iceberg table.
8. **`ARCHIVE` (Regulatory Cold Tiering)**
   - *Target:* Inactive historical data ($>3\text{ years}$ untouched) kept solely for audit.
   - *Action:* Migrated to GCS Archive Storage class with Iceberg metadata registration.
9. **`VIRTUALIZE` (Zero-Copy External Federation)**
   - *Target:* Regulated databases where data cannot leave the source location.
   - *Action:* BigLake external table federation with pushdown SQL.
10. **`EXCLUDE` (Decommission & Omit)**
    - *Target:* Temporary backup tables, staging scratchpads unused for $>180\text{ days}$.
    - *Action:* Omitted from migration; documented in the legacy retirement audit log.

---

## 2. Autonomous Wave Planning Algorithm

The `StrategyPlannerAgent` organizes thousands of tables into sequential migration waves using a **Multi-Objective Directed Acyclic Graph (DAG) Solver**:

### Formulation & Objective
$$\min \quad \text{Risk}(\text{Wave}) = w_1 \cdot \text{EgressCost} + w_2 \cdot \text{DependencyCycles} + w_3 \cdot \text{ReplicationLag}$$
$$\text{Subject to:} \quad \text{ComputeQuota}_{\text{Spark}} \le \text{MaxSlots}, \quad \text{NetworkBandwidth} \le \text{WAN}_{\text{Cap}}$$

### Wave Execution Steps
1. **Topological Sort:** Build an adjacency matrix of all tables based on foreign keys and SQL pipeline lineage.
2. **Cycle Breaking:** Detect circular foreign key dependencies. Break cycles by decoupling constraint validation into post-load verification steps.
3. **Bandwidth Bin-Packing:** Group tables into waves sized to fit available network and compute limits.
4. **Cutover Readiness Check:** A wave is eligible for cutover only when all upstream dependencies have passed Tier 3 Cryptographic and Tier 4 Semantic Proof checks.

---

## 3. Legacy Procedural Code Transpilation

Proprietary stored procedures (Oracle PL/SQL, Teradata BTEQ, SQL Server T-SQL) are transpiled into deterministic **PySpark DAGs**:

```
[Legacy PL/SQL / BTEQ Code]
            │
            ▼
[SQLGlot AST Parsing & Control Flow Extraction]
            │
            ▼
[Gemini 2.5 Pro PySpark Code Synthesis]
            │
            ▼
[Synthetic Test Fixture Generation]
            │
            ▼
[PySpark Execution on Serverless Spark]
            │
    Assert Equivalence
    ├── Pass: Commit to GitOps Migration-as-Code
    └── Fail: Semantic Reflection Loop (Max 3 iterations)
```
