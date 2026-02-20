# Plugin Validation Report: interfluence

**Date:** 2026-02-18
**Plugin Version:** 0.2.0
**Location:** `/home/mk/.claude/plugins/cache/interagency-marketplace/interfluence/0.2.0/`
**Source:** `eg:~/projects/interfluence` (marketplace cached clone)

---

## Summary

**PASS** -- The interfluence plugin is well-structured and functional. It has valid JSON manifests, a properly bundled MCP server, well-written skills and commands, and a working hook. Two minor issues found: an MCP server version string mismatch and the skills directory using flat `.md` files instead of the standard `<skill-name>/SKILL.md` directory convention. No critical issues. No security concerns.

| Category           | Count | Valid | Status |
|--------------------|-------|-------|--------|
| Commands           | 1     | 1     | PASS   |
| Agents             | 1     | 1     | PASS*  |
| Skills             | 5     | 5     | PASS   |
| Hooks              | 1     | 1     | PASS   |
| MCP Servers        | 1     | 1     | PASS   |

*Agent passes functionally but is missing optional `name` and `color` frontmatter fields.

---

## 1. Manifest Validation (`.claude-plugin/plugin.json`)

**Status: PASS**

```json
{
  "name": "interfluence",
  "version": "0.2.0",
  "description": "Analyze your writing style and adapt Claude's output to sound like you...",
  "author": { "name": "mistakeknot", "email": "mistakeknot@vibeguider.org" },
  "hooks": "./hooks/hooks.json",
  "mcpServers": { "interfluence": { "type": "stdio", "command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/server/dist/bundle.js"], "env": {} } }
}
```

| Check | Result | Notes |
|-------|--------|-------|
| Valid JSON | PASS | Parsed successfully with `jq` |
| `name` field | PASS | `"interfluence"` -- kebab-case, no spaces |
| `version` field | PASS | `"0.2.0"` -- valid semver |
| `description` field | PASS | Non-empty, descriptive |
| `author` field | PASS | Has `name` and `email` |
| `hooks` field | PASS | Points to `./hooks/hooks.json` which exists |
| `mcpServers` field | PASS | Valid stdio config with `${CLAUDE_PLUGIN_ROOT}` |
| No unknown fields | PASS | All fields are standard |

---

## 2. Directory Structure

**Status: PASS**

```
.claude-plugin/plugin.json   -- Manifest
commands/interfluence.md      -- Slash command router
agents/voice-analyzer.md      -- Voice analysis agent
skills/                       -- 5 skill files (flat, not directories)
  ingest.md
  analyze.md
  apply.md
  refine.md
  compare.md
hooks/
  hooks.json                  -- Hook definitions
  learn-from-edits.sh         -- Hook script (executable)
server/
  src/                        -- TypeScript source
  dist/bundle.js              -- Pre-built esbuild bundle (1.2MB)
  package.json                -- Server dependencies
  tsconfig.json               -- TypeScript config
samples/                      -- Writing sample(s)
scripts/                      -- Version management scripts
docs/                         -- Solutions docs
README.md                     -- Comprehensive README
CLAUDE.md                     -- Quick reference
AGENTS.md                     -- Development guide
.beads/                       -- Beads integration
.gitignore                    -- Present
.gitattributes                -- Present
```

**Observations:**
- No `node_modules/` in cache (correct -- esbuild bundle is self-contained)
- No LICENSE file (minor omission)
- `.orphaned_at` file present with timestamp `1771470869211` -- this is a marketplace cache marker, not a plugin issue

---

## 3. Command Validation (`commands/interfluence.md`)

**Status: PASS**

| Check | Result | Notes |
|-------|--------|-------|
| YAML frontmatter | PASS | Delimited with `---` |
| `description` field | N/A | Not present, but not required for commands |
| `allowed-tools` | PASS | 17 MCP tools + 7 built-in tools listed |
| Markdown content | PASS | Router with 8 subcommands documented |
| File naming | PASS | `interfluence.md` creates `/interfluence` command |

**Tool list in `allowed-tools`:**
- MCP tools: `corpus_add`, `corpus_add_text`, `corpus_list`, `corpus_get`, `corpus_get_all`, `corpus_remove`, `profile_get`, `profile_save`, `profile_list`, `config_get`, `config_save`, `learnings_append`, `learnings_get_raw`, `learnings_clear_raw`
- Built-in: `Read`, `Write`, `Edit`, `WebFetch`, `Glob`, `Grep`, `Task`

All MCP tools listed correspond to tools registered in the server source code (verified against `corpus.ts` and `profile.ts`).

---

## 4. Agent Validation (`agents/voice-analyzer.md`)

**Status: PASS (with minor gaps)**

| Check | Result | Notes |
|-------|--------|-------|
| YAML frontmatter | PASS | Present with `---` delimiters |
| `description` field | PASS | Clear, actionable description |
| `allowed-tools` | PASS | 8 MCP tools listed, all valid |
| `model` field | PASS | `opus` -- valid model identifier |
| `name` field | MISSING | Not in frontmatter (derived from filename) |
| `color` field | MISSING | Not in frontmatter |
| System prompt | PASS | 102 lines, detailed literary analysis instructions |
| `<example>` blocks | ABSENT | Description lacks `<example>` blocks |

**Assessment:** The agent is functionally complete. The `name` and `color` fields are optional in current plugin spec -- the name is derived from the filename (`voice-analyzer`). The system prompt is thorough, covering multi-voice analysis, H2-section output format, graceful degradation, and important constraints. The description lacks `<example>` blocks for trigger matching, but this is a minor quality issue since the agent is invoked explicitly from the `analyze` skill via `Task`, not by natural language routing.

---

## 5. Skills Validation

**Status: PASS (structural note)**

All 5 skills have valid YAML frontmatter with `description` and `allowed-tools` fields. Each has substantial instructional markdown content.

### Structural Note

Skills are stored as flat `.md` files in `skills/` rather than in the standard `<skill-name>/SKILL.md` directory convention. Both formats are supported by Claude Code's auto-discovery, but the directory convention allows for `references/`, `examples/`, and `scripts/` subdirectories. This is fine for this plugin since none of the skills need supporting files.

### Per-Skill Validation

| Skill | Description | Tools | Content | Status |
|-------|-------------|-------|---------|--------|
| `ingest.md` | Add writing samples | 6 tools | 32 lines | PASS |
| `analyze.md` | Generate voice profiles | 7 tools | 38 lines | PASS |
| `apply.md` | Rewrite in user's voice | 6 tools | 57 lines | PASS |
| `refine.md` | Review and refine profiles | 8 tools | 54 lines | PASS |
| `compare.md` | Compare text against voices | 4 tools | 51 lines | PASS |

**Quality observations:**
- All skills have clear trigger phrases in their descriptions (important for routing)
- Tool lists are scoped appropriately (each skill only requests the tools it needs)
- Instructions are detailed and procedural, not vague
- Cross-references between skills exist (e.g., compare offers to hand off to apply)

---

## 6. Hooks Validation (`hooks/hooks.json`)

**Status: PASS**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/learn-from-edits.sh",
        "timeout": 5
      }]
    }]
  }
}
```

| Check | Result | Notes |
|-------|--------|-------|
| Valid JSON | PASS | Parsed successfully |
| Event name | PASS | `PostToolUse` is a valid hook event |
| `matcher` field | PASS | `"Edit"` -- matches the Edit tool |
| `type` field | PASS | `"command"` -- runs a shell script |
| `command` path | PASS | Uses `${CLAUDE_PLUGIN_ROOT}` for portability |
| `timeout` field | PASS | 5 seconds -- reasonable for logging |
| Script exists | PASS | `hooks/learn-from-edits.sh` exists |
| Script executable | PASS | Permissions: `0770 (-rwxrwx---)` |

### Hook Script Analysis (`learn-from-edits.sh`)

The script is well-structured:
- Checks `CLAUDE_TOOL_NAME` is "Edit" before proceeding
- Walks up directory tree to find `.interfluence/` directory
- Checks `learnFromEdits` config setting before logging
- Excludes `CLAUDE.md`, `AGENTS.md`, and `.interfluence/` files
- Appends timestamped diff entries to `learnings-raw.log`
- Exits cleanly (exit 0) on all non-matching paths

**One minor observation:** The script reads `CLAUDE_TOOL_INPUT_FILE_PATH`, `CLAUDE_TOOL_INPUT_OLD_STRING`, and `CLAUDE_TOOL_INPUT_NEW_STRING` environment variables. These are the correct Claude Code hook environment variables for the Edit tool.

---

## 7. MCP Server Validation

**Status: PASS (with minor version mismatch)**

### Configuration
- **Type:** stdio
- **Command:** `node`
- **Entry point:** `${CLAUDE_PLUGIN_ROOT}/server/dist/bundle.js`
- **Bundle size:** 1.2MB (33,171 lines)
- **Node requirement:** Works with Node v22.22.0 (tested)

### Server Source Analysis

The MCP server registers 11 tools across 2 modules:

**Corpus tools** (`server/src/tools/corpus.ts`):
1. `corpus_add` -- Add sample from file path
2. `corpus_add_text` -- Add sample from raw text
3. `corpus_list` -- List all samples
4. `corpus_get` -- Get single sample by ID
5. `corpus_get_all` -- Get all samples concatenated
6. `corpus_remove` -- Remove a sample

**Profile tools** (`server/src/tools/profile.ts`):
7. `profile_get` -- Get voice profile (base or named)
8. `profile_save` -- Save voice profile
9. `profile_list` -- List available voices
10. `config_get` -- Get interfluence config
11. `config_save` -- Save interfluence config
12. `learnings_append` -- Append learning entry
13. `learnings_get_raw` -- Get raw learnings
14. `learnings_clear_raw` -- Clear processed learnings

(14 tools total, not 11 -- I miscounted initially)

### Version Mismatch (Minor)

```
server/src/index.ts line 8:  version: "0.1.0"
plugin.json:                  version: "0.2.0"
server/package.json:          version: "0.2.0"
```

The MCP server's `McpServer` constructor declares version `"0.1.0"` while the plugin and package are at `0.2.0`. This is cosmetic -- the MCP server version string is used for protocol negotiation logging, not for functionality. However, it should be kept in sync.

### Utility Modules

- `utils/paths.ts` -- File path resolution, voice name validation (`/^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/`), directory creation
- `utils/corpus-index.ts` -- YAML-based corpus index management with sample ID generation
- `utils/voice-resolution.ts` -- File-to-voice matching using minimatch glob patterns

### Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.12.1",
  "js-yaml": "^4.1.0",
  "minimatch": "^10.2.1",
  "turndown": "^7.2.0"
}
```

All dependencies are bundled via esbuild into `dist/bundle.js`. No runtime `npm install` needed. The `turndown` dependency (HTML-to-Markdown converter) is available but not imported in the current source -- likely planned for future URL ingestion support in the server.

---

## 8. Security Analysis

**Status: PASS**

| Check | Result | Notes |
|-------|--------|-------|
| Hardcoded credentials | NONE | No API keys, tokens, or passwords in source |
| HTTP vs HTTPS | N/A | MCP server is stdio, no network URLs |
| Hook safety | PASS | Hook only appends to a log file, no destructive operations |
| File traversal | LOW RISK | Server trusts `projectDir` from Claude, but this is standard MCP pattern |
| Sample data | CLEAN | Sample file is a public blog post, no sensitive content |

The `http://` references found in `bundle.js` are all from the bundled `ajv` JSON Schema validator library (schema URIs), not actual network calls.

---

## 9. File Organization

| Check | Result | Notes |
|-------|--------|-------|
| README.md | PASS | 74 lines, comprehensive with architecture and design decisions |
| CLAUDE.md | PASS | 41 lines, quick reference with build instructions |
| AGENTS.md | PRESENT | Full development guide |
| .gitignore | PASS | Present |
| .gitattributes | PASS | Present |
| LICENSE | MISSING | No license file |
| Unnecessary files | `.orphaned_at` | Marketplace cache artifact, not harmful |

---

## Critical Issues (0)

None.

---

## Warnings (3)

1. **`server/src/index.ts:8`** -- MCP server version is `"0.1.0"` while plugin manifest and package.json are `"0.2.0"`. Should be kept in sync. **Fix:** Update `version` in the `McpServer` constructor to `"0.2.0"`.

2. **`agents/voice-analyzer.md`** -- Missing optional `name` and `color` frontmatter fields. The agent works fine without them (name is derived from filename), but explicit fields are considered best practice. **Fix:** Add `name: voice-analyzer` and `color: magenta` (or appropriate color) to frontmatter.

3. **Plugin root** -- `.orphaned_at` file present (timestamp: `1771470869211` = 2026-02-19T18:14:29Z). This indicates the marketplace cache has marked this version as orphaned, possibly because a newer version exists or the plugin was uninstalled and reinstalled. This is a marketplace cache management detail, not a plugin quality issue.

---

## Positive Findings

1. **Pre-built bundle committed to repo** -- The esbuild bundle eliminates the need for `npm install` during plugin install. This is the correct approach for Claude Code plugins and is explicitly called out in the README's design decisions.

2. **Scoped tool permissions** -- Each skill and agent requests only the MCP tools it needs, not the full set. This follows the principle of least privilege.

3. **Well-structured hook** -- The `learn-from-edits.sh` hook has proper guard clauses (tool type check, directory existence, config check, exclusion patterns) and fails silently on non-matching paths. The 5-second timeout is appropriate for a file-append operation.

4. **Portable paths** -- All references to plugin files use `${CLAUDE_PLUGIN_ROOT}`, ensuring the plugin works regardless of install location.

5. **README quality** -- The README is written in the user's own voice (meta-appropriate for a voice profile plugin), explains architecture and design decisions, and provides clear getting-started instructions.

6. **Voice resolution architecture** -- The `voice-resolution.ts` utility implements ordered first-match-wins glob pattern matching, which is a clean and predictable routing mechanism.

7. **Config/filesystem reconciliation** -- The `profile_list` tool warns when config references voices that don't exist on disk, and when voice files exist without routing config. This prevents silent misconfiguration.

---

## Recommendations

1. **Sync MCP server version** -- Update `server/src/index.ts` line 8 from `"0.1.0"` to `"0.2.0"` and rebuild the bundle. This is a one-line fix.

2. **Add LICENSE file** -- Even for marketplace-distributed plugins, a license file clarifies usage rights. MIT or Apache-2.0 are common choices.

3. **Consider skill directory convention** -- If any skill eventually needs supporting reference files or example templates, migrating from `skills/ingest.md` to `skills/ingest/SKILL.md` would allow adding `skills/ingest/references/` and `skills/ingest/examples/` subdirectories. Not urgent since the current skills are self-contained.

4. **Remove unused `turndown` dependency** -- The `turndown` package is listed in `package.json` dependencies but not imported in the current source code. If URL-to-markdown conversion is planned for the future, keep it; otherwise, removing it would reduce the bundle size.

---

## Overall Assessment

**PASS** -- The interfluence plugin is well-designed, properly structured, and ready for production use. The MCP server is correctly bundled, the hooks are safe, the skills are well-scoped, and the command router covers all subcommands. The only actionable item is the version string mismatch in the MCP server constructor, which is cosmetic.
