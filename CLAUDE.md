# Interfluence

Voice profile plugin for Claude Code. Analyzes writing samples, builds a style profile, and adapts AI-generated text to sound like you.

## Quick Reference

- **Plugin manifest**: `.claude-plugin/plugin.json`
- **MCP server**: `server/` (TypeScript, Node)
- **Build**: `cd server && npm install --cache /tmp/npm-cache && npx tsc`
- **Version locations**: `.claude-plugin/plugin.json`, `server/package.json`, marketplace entry
- **Bump version**: `scripts/bump-version.sh <version>` (updates all 3, commits, pushes)

## Architecture

```
.claude-plugin/plugin.json   → Plugin manifest + MCP server declaration
server/src/                  → MCP server (corpus CRUD, profile, config, learnings)
skills/                      → ingest, analyze, apply, refine, compare
agents/                      → voice-analyzer (Opus, deep literary analysis)
hooks/                       → learn-from-edits.sh (PostToolUse on Edit)
commands/                    → /interfluence router
```

## Per-Project Data

When used, creates `.interfluence/` in the target project:
- `voice-profile.md` — human-readable + Claude-followable voice profile
- `config.yaml` — mode (auto/manual), scope, exclusions
- `corpus/` — normalized writing samples
- `corpus-index.yaml` — sample metadata
- `learnings-raw.log` — accumulated edit diffs for batch review

## Key Design Decisions

- **TypeScript MCP server** — Claude does the NLP, server just manages data
- **Prose voice profiles** — not numeric scores; Claude follows natural language better
- **Batched learning** — edit diffs logged silently, reviewed during `/interfluence refine`
- **Manual mode default** — explicit `/interfluence apply` until user opts into auto

See `AGENTS.md` for full development guide.
