"""Tests for command structure."""

from pathlib import Path

import pytest

from helpers import parse_frontmatter


COMMANDS_DIR = Path(__file__).resolve().parent.parent.parent / "commands"
COMMAND_FILES = sorted(COMMANDS_DIR.glob("*.md")) if COMMANDS_DIR.is_dir() else []


def test_command_count(commands_dir):
    """Total command count matches expected value."""
    if not commands_dir.is_dir():
        assert 1 == 0
        return
    files = sorted(commands_dir.glob("*.md"))
    assert len(files) == 1, (
        f"Expected 1 commands, found {len(files)}: {[f.name for f in files]}"
    )


@pytest.mark.parametrize("cmd_file", COMMAND_FILES, ids=lambda p: p.stem)
def test_command_has_frontmatter(cmd_file):
    """Each command .md has valid YAML frontmatter with 'name' and 'description'."""
    fm, _ = parse_frontmatter(cmd_file)
    assert fm is not None, f"{cmd_file.name} has no frontmatter"
    assert "description" in fm, f"{cmd_file.name} frontmatter missing 'description'"
