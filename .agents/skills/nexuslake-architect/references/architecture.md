# NexusLake Architecture Reference: The Four-Plane Topology

This document details the architectural separation of concerns, communication protocols, and cloud service integration across the four planes of the NexusLake Agentic Architect platform.

---

## 1. Architectural Principles

1. **Decoupled Control & Data Planes:**
   The NexusLake SaaS Control Plane never directly mounts or reads raw customer database rows. All agent interaction occurs via signed metadata descriptors, statistical summaries, and execution orchestrations.
2. **Deterministic Cloud Execution:**
   LLMs (Gemini 2.5 Pro and Flash) generate plans, transpile code, evaluate root causes, and explain decisions. Highly scalable, battle-tested Google Cloud infrastructure (Serverless Spark, Cloud Datastream, Cloud Dataflow, Cloud Storage, BigQuery) executes the actual movement, transformation, and verification.
3. **Open Standards Lakehouse:**
   All migrated assets land in **Apache Iceberg v2 format** on Google Cloud Storage and register with the **BigLake Iceberg REST Catalog**. This guarantees open multi-engine interoperability (BigQuery, Spark, Trino, Flink, Ray) and eliminates vendor lock-in.

---

## 2. Deep Dive: The Four Planes

### Plane 1: Agentic Control Plane (Hosted SaaS)
- **Deployment:** Google Cloud Run (microservices) and Google Kubernetes Engine (GKE) running in NexusLake's managed tenant project.
- **Components:**
  - **Orchestration Core:** Built on the Google Agent Development Kit (ADK) and LangGraph. Houses the multi-agent state machines, reflection loops, and supervisor agents.
  - **AgentGuard Firewall:** Central policy enforcement point evaluating syntactic safety, IAM permissions, risk scores, and data sensitivity before any command reaches customer infrastructure.
  - **Migration-as-Code Compiler:** Compiles agent decisions into version-controlled declarative YAML manifests.
  - **Natural Language Console:** Fast conversational API allowing operators to query estate state, inspect lineage, and approve migration gates.

### Plane 2: Data Intelligence Plane (Customer VPC / Metadata Boundary)
- **Deployment:** Containerized worker agents running inside the customer's VPC, connecting to the Control Plane via Private Service Connect (PSC).
- **Components:**
  - **Universal Connector Layer:** Implements `SourceConnector` contracts for JDBC, NoSQL APIs, file systems, and CDC log miners.
  - **Canonical Metadata Graph:** Maintains the active graph of all `DataAsset` nodes, dependency edges, lineage traces, and quality profiles.
  - **Proof Engine Compute:** Pushes mathematical sketch queries (HLL, min/max, Merkle DAG hashes) directly into customer compute engines without extracting raw data.

### Plane 3: Deterministic Execution Plane (Customer Compute Tenant)
- **Deployment:** Fully serverless, managed Google Cloud data services within customer projects.
- **Components:**
  - **Google Cloud Serverless Spark:** Executes batch loads, heavy transformations, stored procedure transpiled DAGs, and Day-2 file compactions without requiring persistent cluster management.
  - **Google Cloud Datastream:** Serverless CDC engine capturing transactional mutations from Oracle, PostgreSQL, MySQL, and SQL Server, writing change streams to GCS.
  - **Google Cloud Dataflow:** Apache Beam streaming runtime for deduplication, continuous sanitization, and real-time Iceberg ingestion.
  - **Sensitive Data Protection (Cloud DLP):** In-flight inspection and tokenization of PII/PHI.
  - **In-Flight Vectorizer:** Invokes Vertex AI text and multimodal embedding models (`text-embedding-004`, `multimodalembedding@001`) during document ingestion.

### Plane 4: Governed Lakehouse Plane (Storage & Serving)
- **Components:**
  - **Google Cloud Storage (GCS):** Scalable object storage storing Apache Iceberg Parquet files, Puffin index files, and position-delete files.
  - **BigLake Iceberg REST Catalog:** Fully managed, open REST catalog endpoint (`biglake.googleapis.com`) serving as the universal metadata authority.
  - **Dataplex Knowledge Catalog:** Automatically inherits security tags, fine-grained column masking, and row-level access control across both BigQuery and open-source engines.
  - **Multi-Engine Serving:** Allows seamless concurrent queries from BigQuery Lakehouse Engine, Serverless Spark SQL, Trino/Starburst, and Vertex AI RAG pipelines.

---

## 3. Security & Network Isolation

```
[NexusLake Managed SaaS]
   │
   │ (Signed Migration-as-Code Manifests & Metadata)
   ▼
[Private Service Connect Endpoint (Customer VPC)]
   │
   ▼
[Workload Identity Federation] ──> Ephemeral short-lived OIDC tokens
   │
   ▼
[Customer Compute: Spark / Datastream / BigQuery]
   │
   ▼
[Customer Storage: GCS (Encrypted via CMEK in Cloud KMS)]
```

- **Zero Inbound Public Ports:** All communication is outbound from customer workers or routed through dedicated Private Service Connect (PSC) interfaces.
- **No Static Service Account Keys:** Ephemeral credentials generated dynamically using Workload Identity Federation.
- **Encryption at Rest:** Protected via Customer-Managed Encryption Keys (CMEK) managed in Google Cloud KMS.
