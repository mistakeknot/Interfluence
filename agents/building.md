# Building & Version Management

## Building

```bash
cd server
npm install --cache /tmp/npm-cache   # Workaround for claude-user npm cache permissions
npm run build                         # tsc + esbuild -> server/dist/bundle.js
```

The MCP server entry in plugin.json points to `${CLAUDE_PLUGIN_ROOT}/server/dist/bundle.js`.

### Dependencies

- `@modelcontextprotocol/sdk` — MCP server framework
- `js-yaml` — YAML parse/dump for config and corpus index
- `minimatch` — Glob pattern matching for voice resolution
- `turndown` — HTML-to-markdown (declared but currently unused)

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

## MCP Server Bundling

- MCP server is bundled with esbuild into `server/dist/bundle.js` (committed for zero-install)
- MCP servers with npm dependencies MUST be bundled — plugin install only clones, no build step runs
- `author` in plugin.json must be an object, not a string (causes install failure)
