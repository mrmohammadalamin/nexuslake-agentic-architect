"""
NexusLake LakehouseSREAgent
Continuously monitors Apache Iceberg tables for small files, snapshot bloat, and query scan degradation.
Evaluates FinOps ROI before triggering Serverless Spark bin-packing compactions.
"""

from typing import Any, Dict, List
from src.policies.agent_guard import ActionProposal, ActionType, AgentGuard, PolicyVerdict


class CompactionRecommendation:
    def __init__(
        self,
        table_name: str,
        current_small_files: int,
        current_avg_file_size_mb: float,
        target_file_size_mb: int,
        estimated_spark_compute_cost_usd: float,
        estimated_30day_query_scan_savings_usd: float,
        roi_multiplier: float,
        is_recommended: bool,
        action_proposal: ActionProposal,
        policy_verdict: PolicyVerdict,
    ):
        self.table_name = table_name
        self.current_small_files = current_small_files
        self.current_avg_file_size_mb = current_avg_file_size_mb
        self.target_file_size_mb = target_file_size_mb
        self.estimated_spark_compute_cost_usd = estimated_spark_compute_cost_usd
        self.estimated_30day_query_scan_savings_usd = estimated_30day_query_scan_savings_usd
        self.roi_multiplier = roi_multiplier
        self.is_recommended = is_recommended
        self.action_proposal = action_proposal
        self.policy_verdict = policy_verdict

    def to_dict(self) -> Dict[str, Any]:
        return {
            "table_name": self.table_name,
            "current_small_files": self.current_small_files,
            "current_avg_file_size_mb": self.current_avg_file_size_mb,
            "target_file_size_mb": self.target_file_size_mb,
            "estimated_spark_compute_cost_usd": self.estimated_spark_compute_cost_usd,
            "estimated_30day_query_scan_savings_usd": self.estimated_30day_query_scan_savings_usd,
            "roi_multiplier": round(self.roi_multiplier, 2),
            "is_recommended": self.is_recommended,
            "allowed_by_agent_guard": self.policy_verdict.allowed,
            "risk_tier": self.policy_verdict.risk_tier.value,
            "audit_message": self.policy_verdict.audit_message,
        }


class LakehouseSREAgent:
    """Agent running continuous Day-2 monitoring and FinOps-gated optimizations."""

    def __init__(self, agent_guard: AgentGuard):
        self.agent_guard = agent_guard

    def analyze_table_health(
        self, table_name: str, file_count: int, total_size_mb: float, monthly_queries: int = 15000
    ) -> CompactionRecommendation:
        avg_size = total_size_mb / max(file_count, 1)

        # FinOps Economics Model
        # Serverless Spark compaction cost estimate (approx $0.10 per GB processed)
        spark_compute_cost = round((total_size_mb / 1024.0) * 0.12 + 0.50, 2)

        # BigQuery Slot Scan savings: reducing file metadata overhead and scan amplification
        # Excessive files cause 3x-8x slot scan latency
        if avg_size < 64.0:  # Small files problem detected (target is 256 MB)!
            monthly_scan_savings = round((monthly_queries * 0.003) * (128.0 / max(avg_size, 1.0)), 2)
        else:
            monthly_scan_savings = 0.0

        roi = monthly_scan_savings / max(spark_compute_cost, 0.01)
        is_recommended = (roi >= 2.5) and (file_count > 20)

        proposal = ActionProposal(
            action_id=f"act-compact-{table_name.replace('.', '_')}",
            action_type=ActionType.RUN_COMPACTION,
            agent_name="LakehouseSREAgent",
            target_resource=f"iceberg_table:{table_name}",
            payload={
                "operation": "rewrite_data_files",
                "strategy": "binpack",
                "target_file_size_bytes": 268435456,  # 256 MB
                "filter_spec": "all_partitions",
            },
            rationale=(
                f"Table has {file_count} small files averaging {avg_size:.1f} MB. "
                f"Compaction yields {roi:.1f}x ROI (Savings: ${monthly_scan_savings:.2f} vs Cost: ${spark_compute_cost:.2f})."
            ),
            estimated_cost_usd=spark_compute_cost,
        )

        verdict = self.agent_guard.evaluate_proposal(proposal)

        return CompactionRecommendation(
            table_name=table_name,
            current_small_files=file_count,
            current_avg_file_size_mb=round(avg_size, 2),
            target_file_size_mb=256,
            estimated_spark_compute_cost_usd=spark_compute_cost,
            estimated_30day_query_scan_savings_usd=monthly_scan_savings,
            roi_multiplier=roi,
            is_recommended=is_recommended,
            action_proposal=proposal,
            policy_verdict=verdict,
        )
