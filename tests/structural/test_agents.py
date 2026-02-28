"""Tests for agent structure."""

from pathlib import Path


AGENTS_DIR = Path(__file__).resolve().parent.parent.parent / "agents"


def test_agent_count():
    """Total agent count matches expected value."""
    agent_files = []
    if AGENTS_DIR.is_dir():
        for subdir in AGENTS_DIR.iterdir():
            if subdir.is_dir():
                agent_files.extend(sorted(subdir.glob("*.md")))
            elif subdir.suffix == ".md" and subdir.name != "README.md":
                agent_files.append(subdir)
    # Also check .claude/agents/ for Claude subagents
    claude_agents = Path(__file__).resolve().parent.parent.parent / ".claude" / "agents"
    if claude_agents.is_dir():
        agent_files.extend(sorted(claude_agents.glob("*.md")))
    assert len(agent_files) == 1, (
        f"Expected 1 agents, found {len(agent_files)}: {[f.name for f in agent_files]}"
    )
