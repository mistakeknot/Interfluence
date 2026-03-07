# Roadmap

## MVP (shipped)
- Ingest (files, URLs)
- Analyze (single voice profile from corpus)
- Apply (explicit `/interfluence apply <file>`)
- Refine (interactive editing + batch learning review)
- Config (auto/manual mode toggle)
- Learn (passive hook logging diffs)

## v0.2.0 (in progress — code-switching)
- Voice-aware profile storage (F1) — `profile_get`/`profile_save` with optional voice param, `profile_list`
- Config schema with voices array (F2) — ordered glob patterns, first-match-wins
- Voice analyzer comparative analysis (F3) — classify corpus, extract invariants as base, generate deltas
- Apply skill voice resolution (F4) — auto-resolve from file path, `--voice` override, H2-section merge
- Learning hook context tagging (F5) — tag as `CONTEXT:unknown`, resolve in refine skill
- Skill & command updates (F6) — multi-voice compare, analyze triggers comparative flow

PRD: `docs/prds/2026-02-18-interfluence-code-switching.md`

## Post-MVP
- Multi-source weighting
- Notion API direct ingestion
- Profile export/import
- Incremental analysis (`--incremental` flag)
- `--dry-run` / `--explain` for voice resolution debugging
- `/interfluence explain-voices` (delta model education)
- `/interfluence merge-voices` (revert to single profile)
