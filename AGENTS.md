# interfluence — Agent Development Guide

Voice profile plugin for Claude Code. Analyzes a user's writing corpus and adapts AI-generated documentation/copy to match their style.

## Architecture Overview

### MCP Server (`server/`)

TypeScript server providing 9 tools for data management. Claude does all the analysis — the server just stores and serves data.

**Corpus tools:**
- `corpus_add` — Add sample from file path
- `corpus_add_text` — Add sample from raw text (URLs, clipboard)
- `corpus_list` — List all samples with metadata
- `corpus_get` — Get a single sample's text
- `corpus_get_all` — Get all samples concatenated (for analysis)
- `corpus_remove` — Delete a sample

**Profile tools:**
- `profile_get` — Read the voice profile
- `profile_save` — Write the voice profile

**Config tools:**
- `config_get` — Read config (mode, scope, exclusions)
- `config_save` — Update config

**Learning tools:**
- `learnings_append` — Log an edit diff
- `learnings_get_raw` — Read accumulated diffs
- `learnings_clear_raw` — Clear processed diffs

All tools take `projectDir` as the first parameter — this is the absolute path to the project where `.interfluence/` lives (the target project, not the plugin itself).

### Skills (`skills/`)

| Skill | Trigger phrases | Purpose |
|-------|----------------|---------|
| `ingest` | "ingest", "add writing sample", "add my blog post" | Add samples from files, dirs, URLs |
| `analyze` | "analyze my writing", "build voice profile" | Generate voice profile from corpus |
| `apply` | "apply my voice", "rewrite in my style", "make this sound like me" | Restyle a file using the voice profile |
| `refine` | "refine my voice profile", "that's not how I'd say it" | Interactive profile editing + batch learning review |
| `compare` | "does this sound like me", "A/B test my voice" | Diagnose voice match quality |

### Agent (`agents/voice-analyzer.md`)

Opus-powered literary analyst. Used by the `analyze` skill for deep corpus analysis. Produces structured voice profiles with:
- Prose descriptions per dimension (sentence structure, vocabulary, tone, etc.)
- Direct quotes from the corpus as evidence
- "Do this / Not this" transformation pairs
- Confidence notes when corpus is small

### Hook (`hooks/learn-from-edits.sh`)

PostToolUse hook on Edit. Silently logs diffs to `.interfluence/learnings-raw.log`. Fires only when:
1. The tool is `Edit` (not Write)
2. A `.interfluence/` dir exists in the project tree
3. The file is not excluded (CLAUDE.md, AGENTS.md, .interfluence/)
4. `learnFromEdits` is enabled in config (default: true)

No per-edit Claude call. Diffs are batch-reviewed during `/interfluence refine`.

### Command (`commands/interfluence.md`)

Routes `/interfluence <subcommand>` to the appropriate skill. Shows status overview when invoked with no args.

## Building

```bash
cd server
npm install --cache /tmp/npm-cache   # Workaround for claude-user npm cache permissions
npx tsc                               # Compiles to server/dist/
```

The MCP server entry in plugin.json points to `${CLAUDE_PLUGIN_DIR}/server/dist/index.js`.

## Version Management

Version tracked in 3 places that must stay in sync:
1. `.claude-plugin/plugin.json` — primary
2. `server/package.json` — npm package
3. `interagency-marketplace/.claude-plugin/marketplace.json` — marketplace entry

```bash
scripts/bump-version.sh 0.2.0           # Update all, commit, push
scripts/bump-version.sh 0.2.0 --dry-run # Preview
scripts/check-versions.sh --verbose     # Verify sync
```

**After bumping:** Pull the cached marketplace clone so Claude Code can see the update:
```bash
cd /home/claude-user/.claude/plugins/marketplaces/interagency-marketplace && git pull
```

## Per-Project Data Layout

When a user runs `/interfluence ingest` in their project, this structure is created:

```
their-project/
└── .interfluence/
    ├── voice-profile.md      # The heart — prose descriptions + examples
    ├── config.yaml           # mode: auto|manual, scope, exclusions
    ├── corpus/               # Normalized writing samples
    │   ├── sample-20260211-a3f2.md
    │   └── sample-20260211-b7c1.md
    ├── corpus-index.yaml     # Sample metadata (source, date, word count, tags)
    ├── learnings-raw.log     # Raw edit diffs (batch-reviewed, then cleared)
    └── learnings.md          # Consolidated style learnings (post-MVP)
```

## Voice Profile Format

The profile is markdown with structured sections. Each section contains:
- Prose description of the pattern
- Direct quotes from the corpus
- "Do this / Not this" pairs

Sections: Overview, Sentence Structure, Vocabulary & Diction, Tone & Voice, Structure Patterns, Cultural References, Anti-Patterns.

This format was chosen because Claude follows natural language instructions more reliably than numeric parameters (e.g., "formality: 0.7"). It's also human-editable, which matters for the refinement loop.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| TypeScript MCP server | Plugin ecosystem standard; NLP is done by Claude, not locally |
| Prose voice profiles | Claude follows "uses em-dashes for asides" better than "punctuation_variety: 0.8" |
| Batched learning | No per-edit latency/tokens; higher signal when batch-reviewed |
| Manual mode default | Avoids surprising users; auto mode is opt-in |
| Single profile (MVP) | Context-specific profiles (blog vs commit) deferred to post-MVP |
| `projectDir` on every tool call | Plugin serves data for the target project, not itself |

## Beads

This project uses `bd` for issue tracking. See `.beads/` directory.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress
bd close <id>
```

## Roadmap

### MVP (current)
- Ingest (files, URLs)
- Analyze (single voice profile from corpus)
- Apply (explicit `/interfluence apply <file>`)
- Refine (interactive editing + batch learning review)
- Config (auto/manual mode toggle)
- Learn (passive hook logging diffs)

### Post-MVP
- Context-specific voice profiles (blog vs commit vs PRD)
- Multi-source weighting
- `/interfluence compare` A/B testing
- Notion API direct ingestion
- Profile export/import
- Incremental analysis (`--incremental` flag)
