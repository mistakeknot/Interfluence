# Operational Notes

## Writing Sample Ingestion
- WebFetch summarizes instead of returning raw text; use `curl` + Python HTML parser for full extraction

## Marketplace Publishing
- Local marketplace working copy is NOT what Claude Code reads — it uses a cached clone
- After pushing marketplace changes, cache must be refreshed for plugin to become visible

## Beads

This project uses `bd` for issue tracking. See `.beads/` directory.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress
bd close <id>
```
