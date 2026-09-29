# NexusLake AgentGuard Reference: Policy Boundary & Safety Controls

This document details the architecture, evaluation rules, and Human-in-the-Loop (HITL) workflows enforced by **AgentGuard**.

---

## 1. The AgentGuard Philosophy

Autonomous AI agents must operate under strict, deterministic safety boundaries. LLMs are non-deterministic by nature; enterprise infrastructure requires deterministic reliability. AgentGuard decouples the **agent reasoning** from the **execution privilege**.

```
+-------------------------------------------------------------------------------+
|                               AGENTGUARD CORE PRINCIPLE                       |
|                                                                               |
|   "An agent can suggest, analyze, explain, draft code, and diagnose errors.   |
|    Only the AgentGuard policy engine can authorize commands to execute       |
|    against production cloud infrastructure."                                  |
+-------------------------------------------------------------------------------+
```

---

## 2. Policy Evaluation Pipeline

Every action proposed by any agent passes through four sequential inspection gates:

```
[Agent Emits Action Proposal]
               │
               ▼
[Gate 1: Syntactic AST Inspector]
  * Reject any statement containing DROP, TRUNCATE, or unconstrained DELETE.
  * Reject unapproved Cloud APIs or shell-level execution commands.
               │
               ▼
[Gate 2: Least-Privilege IAM & Identity Assertion]
  * Verify calling service identity matches approved worker role.
  * Verify ephemeral OAuth token validity (Workload Identity Federation).
               │
               ▼
[Gate 3: Data Sensitivity & DLP Check]
  * Query Dataplex Knowledge Catalog for PII/PHI tags on affected resources.
  * Enforce masking if the destination lacks equivalent security tags.
               │
               ▼
[Gate 4: Risk Tier & Approval Classifier]
  * Assign risk tier based on operational impact.
```

---

## 3. Risk Tier Classification Matrix

| Risk Tier | Examples of Operations | Automated vs Human | Approval Mechanism |
| :--- | :--- | :--- | :--- |
| **LOW** | Schema extraction, table profiling, dry-run query compilation, small-file compaction ($<64\text{ MB}$) with positive ROI. | **Fully Autonomous** | System logs audit record to Cloud Logging and proceeds immediately. |
| **MEDIUM** | Datastream stream creation, staging bucket provisioning, creating new staging Iceberg tables, adding non-breaking nullable columns. | **Autonomous with Notification** | Action executed; automated webhook notification sent to project Slack/Teams channel. |
| **HIGH** | Renaming production columns, updating data classification tags, transpiling business-critical stored procedures. | **Mandatory Human Sign-off** | Action paused. Webhook alerts Lead Data Architect with diff preview. Requires 1 approval. |
| **CRITICAL** | Production DNS cutover, decommissioning legacy source tables, stopping legacy CDC replication streams. | **Mandatory Multi-Sig Sign-off** | Action paused. Requires 2 independent architect approvals in NexusLake Console. |

---

## 4. Credential & Secret Management

1. **No Raw Secrets in LLM Context:**
   Connection strings, passwords, and private keys are NEVER fed into Gemini prompts.
2. **Secret Manager References:**
   DataAsset models store references (`projects/prj-sec/secrets/db-conn-01/versions/latest`), never plaintext strings.
3. **Execution Time Secret Retrieval:**
   Deterministic Cloud Run / Serverless Spark jobs retrieve secrets directly from Secret Manager at runtime using their own service account identities.
