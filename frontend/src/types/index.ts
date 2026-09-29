export interface ColumnSpec {
  name: string;
  original_type: string;
  target_iceberg_type: string;
  ordinal_position: number;
  is_nullable: boolean;
  is_primary_key?: boolean;
  is_partition_key?: boolean;
  description?: string;
  security_tag?: string;
}

export interface DataAsset {
  id: string;
  name: string;
  source_system: string;
  asset_type: string;
  columns: ColumnSpec[];
  statistics: {
    row_count?: number;
    total_bytes?: number;
    avg_row_bytes?: number;
    write_churn_qps?: number;
    is_clean_parquet?: boolean;
    hll_cardinality_distinct_pk?: number;
    [key: string]: any;
  };
  relationships?: Array<{ [key: string]: string }>;
  lineage_upstream: string[];
  lineage_downstream: string[];
  business_domain?: string;
  security_classification?: string;
  recommended_strategy?: string;
  strategy_rationale?: string;
}

export interface ConnectionConfig {
  connection_id: string;
  name: string;
  engine: string;
  host?: string;
  port?: number;
  database_name: string;
  username?: string;
  password?: string;
}

export interface TableMigrationPlan {
  source_asset_id: string;
  target_table_name: string;
  strategy: string;
  iceberg_layout?: any;
}

export interface MigrationWave {
  wave_number: number;
  wave_name: string;
  concurrency_limit: number;
  tables: TableMigrationPlan[];
}

export interface MigrationBlueprint {
  blueprint_id: string;
  tenant_id: string;
  target_gcp_project: string;
  region: string;
  catalog_uri: string;
  lakehouse_bucket: string;
  dataplex_lake: string;
  dataplex_zone: string;
  waves: MigrationWave[];
}

export interface ProofCertificate {
  proof_certificate_id: string;
  timestamp: string;
  migration_job_id: string;
  source_system: any;
  target_system: any;
  verifications: {
    tier_1_structural: any;
    tier_2_statistical: any;
    tier_3_cryptographic: any;
    tier_4_semantic: any;
  };
  governance: any;
  overall_status: string;
  signoff: any;
}

export interface SRERecommendation {
  table_name: string;
  current_small_files: number;
  current_avg_file_size_mb: number;
  target_file_size_mb: number;
  estimated_spark_compute_cost_usd: number;
  estimated_30day_query_scan_savings_usd: number;
  roi_multiplier: number;
  is_recommended: boolean;
  allowed_by_agent_guard: boolean;
  risk_tier: string;
  audit_message: string;
}
