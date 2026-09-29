# NexusLake Proof Engine Reference: Four-Tier Mathematical Verification

This document specifies the mathematical formulations, pushdown sketch algorithms, and cryptographic proofs executed by the **Migration Proof Engine**.

---

## 1. The Verification Challenge

Legacy data migrations often rely on naive `SELECT COUNT(*)` comparisons. This approach fails to detect:
- Silent column truncation (e.g., `VARCHAR(255)` truncated to `VARCHAR(50)`).
- Character encoding corruptions (e.g., UTF-8 $\rightarrow$ Latin1 mojibake).
- Subtle floating-point precision differences (`DECIMAL(38, 8)` coerced to `FLOAT64`).
- Missing rows offset by duplicate rows (masking count mismatches).

Extracting petabytes of data across WAN links to compare row-by-row creates prohibitive egress bills and network bottlenecks. The **Migration Proof Engine** executes mathematical proofs **in-engine via pushdown SQL**, moving only cryptographic digests and statistical sketches.

---

## 2. Four-Tier Verification Hierarchy

```
+-------------------------------------------------------------------------------+
|                      TIER 4: SEMANTIC BUSINESS QUERY PROOF                    |
|  * Autonomous execution of business KPI queries (e.g., Gross Margin by Region)|
|  * Assert zero financial or operational metric divergence                     |
+-------------------------------------------------------------------------------+
                                       ▲
                                       │
+-------------------------------------------------------------------------------+
|                   TIER 3: CRYPTOGRAPHIC MERKLE DAG HASH                       |
|  * Commutative XOR aggregate hash computed natively within source and target  |
|  * Mathematical proof of bit-level equivalence across partitions              |
+-------------------------------------------------------------------------------+
                                       ▲
                                       │
+-------------------------------------------------------------------------------+
|                   TIER 2: STATISTICAL CARNALITY & SKETCHES                    |
|  * Pushdown HyperLogLog (HLL) cardinality, null counts, min/max bounds        |
|  * Validates distributions without row-level comparisons                      |
+-------------------------------------------------------------------------------+
                                       ▲
                                       │
+-------------------------------------------------------------------------------+
|                 TIER 1: STRUCTURAL SCHEMA FINGERPRINTING                      |
|  * SHA-256 digest of column ordinals, primitive type widening, nullability    |
+-------------------------------------------------------------------------------+
```

---

## 3. Mathematical Formulations

### Tier 1: Schema Fingerprint Digest
$$\text{Digest}_{\text{Schema}} = \text{SHA256}\left( \sum_{i=1}^M \text{col\_name}_i \,\|\, \text{norm\_type}_i \,\|\, \text{nullable}_i \,\|\, \text{ordinal}_i \right)$$

### Tier 2: Pushdown HyperLogLog Cardinality
Both engines compute approximate distinct counts natively using standard 12-bit registers (standard error $\approx 1.04/\sqrt{2^{12}} = 1.6\%$ or 14-bit $\approx 0.8\%$):
- Source (PostgreSQL / Oracle): `APPROX_COUNT_DISTINCT(column_name)`
- Target (BigQuery / Iceberg): `HLL_COUNT.INIT(column_name, 14)`
Cardinality delta ratio must satisfy:
$$\frac{|\text{HLL}_{\text{Source}} - \text{HLL}_{\text{Target}}|}{\text{HLL}_{\text{Source}}} \le \epsilon \quad (\epsilon = 0.00001)$$

### Tier 3: Partition-Level Merkle Hash (Commutative Digest)
Because distributed database workers return rows in arbitrary order, sorting billions of rows to compute a sequential hash is prohibitively expensive. NexusLake utilizes a **Commutative XOR Hash**:

$$\text{RowDigest}_i = \text{HMAC-SHA256}\Big(\text{PK}_i \,\|\, \text{Col}_{1,i} \,\|\, \text{Col}_{2,i} \,\|\, \dots \,\|\, \text{Col}_{M,i}\Big)$$

$$\text{PartitionMerkleRoot} = \bigoplus_{i=1}^N \text{RowDigest}_i$$

*Mathematical Property:* Because bitwise XOR ($\bigoplus$) is associative and commutative ($A \oplus B = B \oplus A$), the final root hash is identical regardless of distributed worker processing order. 
$$\text{PartitionMerkleRoot}_{\text{Source}} \equiv \text{PartitionMerkleRoot}_{\text{Target}}$$

### Tier 4: Semantic KPI Reconciliation
Gemini generates domain-specific aggregation queries from historical SQL audit logs:
```sql
SELECT 
    fiscal_year,
    business_unit_code,
    COUNT(*) AS total_transactions,
    SUM(gross_amount_usd) AS total_gross_usd,
    AVG(discount_percentage) AS avg_discount
FROM {table_identifier}
GROUP BY 1, 2
ORDER BY 1, 2;
```
Both result sets are diffed. Discrepancy threshold is strictly **$0.000000\%$** for financial values.
