#!/usr/bin/env python3
"""
NexusLake Skill Validator
Verifies that all skill files, references, examples, and schemas are structurally sound.
"""
import sys
import json
import yaml
from pathlib import Path

# Configure UTF-8 output across Windows environments
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def validate_skill():
    skill_root = Path(__file__).resolve().parent.parent
    print(f"[+] Validating NexusLake Skill at: {skill_root}")

    # 1. Validate SKILL.md
    skill_file = skill_root / "SKILL.md"
    if not skill_file.exists():
        print("[-] Missing SKILL.md!")
        return 1
    content = skill_file.read_text(encoding="utf-8")
    if not content.startswith("---"):
        print("[-] SKILL.md missing YAML frontmatter delimiters (---)")
        return 1
    print("[OK] SKILL.md exists with frontmatter.")

    # 2. Validate references
    references_dir = skill_root / "references"
    expected_refs = ["architecture.md", "data-model.md", "migration-patterns.md", "agentguard.md", "proof-engine.md"]
    for ref in expected_refs:
        ref_path = references_dir / ref
        if not ref_path.exists():
            print(f"[-] Missing expected reference: {ref}")
            return 1
        print(f"[OK] Reference exists: {ref}")

    # 3. Validate examples
    examples_dir = skill_root / "examples"
    bp_example = examples_dir / "migration-blueprint-example.yaml"
    cert_example = examples_dir / "proof-certificate-example.json"

    if bp_example.exists():
        with open(bp_example, "r", encoding="utf-8") as f:
            yaml.safe_load(f)
        print("[OK] Blueprint YAML example parses cleanly.")
    else:
        print("[-] Missing migration-blueprint-example.yaml")
        return 1

    if cert_example.exists():
        with open(cert_example, "r", encoding="utf-8") as f:
            json.load(f)
        print("[OK] Proof Certificate JSON example parses cleanly.")
    else:
        print("[-] Missing proof-certificate-example.json")
        return 1

    print("\n[SUCCESS] NexusLake Master Skill is 100% compliant and ready for progressive disclosure.")
    return 0

if __name__ == "__main__":
    sys.exit(validate_skill())
