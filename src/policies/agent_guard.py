"""
NexusLake AgentGuard Action Firewall & Policy Engine
Decouples LLM proposed actions from deterministic cloud execution privileges.
"""

import re
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RiskTier(str, Enum):
    LOW      = "LOW"       # Read-only profiling, metadata inspection, ROI-positive compaction
    MEDIUM   = "MEDIUM"    # Staging bucket creation, stream initialization, nullable column add
    HIGH     = "HIGH"      # Renaming production columns, stored procedure transpilation cutover
    CRITICAL = "CRITICAL"  # Production cutover, stopping replication, decommissioning source


class ActionType(str, Enum):
    PROFILE_METADATA       = "PROFILE_METADATA"
    CREATE_STAGING_BUCKET  = "CREATE_STAGING_BUCKET"
    EXECUTE_SPARK_LOAD     = "EXECUTE_SPARK_LOAD"
    REGISTER_BIGLAKE_TABLE = "REGISTER_BIGLAKE_TABLE"
    ALTER_TABLE_SCHEMA     = "ALTER_TABLE_SCHEMA"
    RUN_COMPACTION         = "RUN_COMPACTION"
    PRODUCTION_CUTOVER     = "PRODUCTION_CUTOVER"
    DECOMMISSION_SOURCE    = "DECOMMISSION_SOURCE"
    RAW_SQL_EXECUTION      = "RAW_SQL_EXECUTION"


class ActionProposal(BaseModel):
    action_id: str
    action_type: ActionType
    agent_name: str
    target_resource: str
    payload: Dict[str, Any]
    rationale: str
    estimated_cost_usd: float = 0.0


class PolicyVerdict(BaseModel):
    allowed: bool
    risk_tier: RiskTier
    requires_human_approval: bool
    approvals_required: int = 0
    policy_violations: List[str] = []
    audit_message: str


class AgentGuard:
    """Action Firewall enforcing least privilege, risk scoring, and HITL safety."""

    FORBIDDEN_SQL_PATTERNS = [
        re.compile(r"\bDROP\s+TABLE\b", re.IGNORECASE),
        re.compile(r"\bDROP\s+DATABASE\b", re.IGNORECASE),
        re.compile(r"\bTRUNCATE\s+TABLE\b", re.IGNORECASE),
    ]

    def __init__(self, cost_budget_usd: float = 50.0):
        self.cost_budget_usd = cost_budget_usd

    def evaluate_proposal(self, proposal: ActionProposal) -> PolicyVerdict:
        violations = []

        # Gate 1: Syntactic Check for destructive DDL/DML
        if proposal.action_type == ActionType.RAW_SQL_EXECUTION:
            sql_text = proposal.payload.get("sql", "")
            for pattern in self.FORBIDDEN_SQL_PATTERNS:
                if pattern.search(sql_text):
                    violations.append(f"Security Violation: Destructive command rejected by AgentGuard ({pattern.pattern}).")
            if re.search(r"\bDELETE\s+FROM\b", sql_text, re.IGNORECASE) and not re.search(r"\bWHERE\b", sql_text, re.IGNORECASE):
                violations.append("Security Violation: Unbounded DELETE statement without WHERE clause rejected by AgentGuard.")

        # Gate 2: FinOps Cost Ceiling Check
        if proposal.estimated_cost_usd > self.cost_budget_usd:
            violations.append(
                f"FinOps Violation: Estimated cost (${proposal.estimated_cost_usd:.2f}) exceeds session budget (${self.cost_budget_usd:.2f})."
            )

        # Gate 3: Risk Classification Tiering
        risk = self._classify_risk(proposal)

        if violations:
            return PolicyVerdict(
                allowed=False,
                risk_tier=risk,
                requires_human_approval=True,
                approvals_required=1,
                policy_violations=violations,
                audit_message=f"Action REJECTED for {proposal.target_resource}: {'; '.join(violations)}",
            )

        # Gate 4: Human-in-the-loop approval requirements
        if risk == RiskTier.CRITICAL:
            return PolicyVerdict(
                allowed=True,
                risk_tier=risk,
                requires_human_approval=True,
                approvals_required=2,  # Multi-Sig
                audit_message=f"CRITICAL Operation for {proposal.target_resource} paused awaiting Multi-Sig Architect Approval.",
            )
        elif risk == RiskTier.HIGH:
            return PolicyVerdict(
                allowed=True,
                risk_tier=risk,
                requires_human_approval=True,
                approvals_required=1,
                audit_message=f"HIGH Risk Operation for {proposal.target_resource} paused awaiting Lead Architect Sign-off.",
            )
        elif risk == RiskTier.MEDIUM:
            return PolicyVerdict(
                allowed=True,
                risk_tier=risk,
                requires_human_approval=False,
                audit_message=f"MEDIUM Risk Operation approved autonomously with audit notification.",
            )
        else:
            return PolicyVerdict(
                allowed=True,
                risk_tier=risk,
                requires_human_approval=False,
                audit_message=f"LOW Risk Operation approved autonomously.",
            )

    def _classify_risk(self, proposal: ActionProposal) -> RiskTier:
        if proposal.action_type in (ActionType.PRODUCTION_CUTOVER, ActionType.DECOMMISSION_SOURCE):
            return RiskTier.CRITICAL
        elif proposal.action_type in (ActionType.ALTER_TABLE_SCHEMA, ActionType.RAW_SQL_EXECUTION):
            return RiskTier.HIGH
        elif proposal.action_type in (ActionType.CREATE_STAGING_BUCKET, ActionType.EXECUTE_SPARK_LOAD):
            return RiskTier.MEDIUM
        return RiskTier.LOW
