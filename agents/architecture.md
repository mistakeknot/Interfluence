# Architecture Overview

Voice profile plugin for Claude Code. Analyzes a user's writing corpus and adapts AI-generated documentation/copy to match their style.

## MCP Server (`server/`)

TypeScript server providing 10 tools for data management. Claude does all the analysis — the server just stores and serves data.

**Corpus tools:**
- `corpus_add` — Add sample from file path
- `corpus_add_text` — Add sample from raw text (URLs, clipboard)
- `corpus_list` — List all samples with metadata
- `corpus_get` — Get a single sample's text
- `corpus_get_all` — Get all samples concatenated (for analysis)
- `corpus_remove` — Delete a sample

**Profile tools:**
- `profile_get(projectDir, voice?)` — Read a voice profile. Omit `voice` for base profile, or pass a voice name (e.g. `"blog"`) for a context delta from `voices/`
- `profile_save(projectDir, content, voice?)` — Write a voice profile. Creates `voices/` dir on first named voice save
- `profile_list(projectDir)` — List available voices (scans `voices/` directory). Includes reconciliation warnings for config/filesystem mismatches

**Config tools:**
- `config_get` — Read config (mode, scope, exclusions, voices)
- `config_save` — Update config. Accepts optional `voices` array (ordered `VoiceConfig[]` — replaces entire array, not merged, to preserve first-match-wins ordering)

**Learning tools:**
- `learnings_append` — Log an edit diff
- `learnings_get_raw` — Read accumulated diffs
- `learnings_clear_raw` — Clear processed diffs

All tools take `projectDir` as the first parameter — this is the absolute path to the project where `.interfluence/` lives (the target project, not the plugin itself).

## Voice Resolution (`server/src/utils/voice-resolution.ts`)

Provides `resolveVoice(filePath, voices)` — iterates an ordered `VoiceConfig[]` array, returning the first voice whose glob patterns (via `minimatch`) match the file path. Returns `null` for base fallback. Used by the apply skill for automatic voice selection from file paths.

```typescript
interface VoiceConfig { name: string; applyTo: string[]; }
```

## Voice Path Helpers (`server/src/utils/paths.ts`)

- `getVoiceProfilePath(projectDir, voice?)` — returns `voice-profile.md` for base, `voices/{voice}.md` for named voices
- `getVoicesDir(projectDir)` — returns `voices/` path (does NOT auto-create)
- `listVoices(projectDir)` — scans filesystem, returns `["base", ...voice_files]`
- `isValidVoiceName(name)` — validates alphanumeric + hyphens, 2-32 chars

## Skills (`skills/`)

| Skill | Trigger phrases | Purpose |
|-------|----------------|---------|
| `ingest` | "ingest", "add writing sample", "add my blog post" | Add samples from files, dirs, URLs |
| `analyze` | "analyze my writing", "build voice profile" | Generate voice profile from corpus |
| `apply` | "apply my voice", "rewrite in my style", "make this sound like me" | Restyle a file using the voice profile |
| `refine` | "refine my voice profile", "that's not how I'd say it" | Interactive profile editing + batch learning review |
| `compare` | "does this sound like me", "A/B test my voice" | Diagnose voice match quality |

## Agent (`agents/voice-analyzer.md`)

Opus-powered literary analyst. Used by the `analyze` skill for deep corpus analysis. Produces structured voice profiles with:
- Prose descriptions per dimension (sentence structure, vocabulary, tone, etc.)
- Direct quotes from the corpus as evidence
- "Do this / Not this" transformation pairs
- Confidence notes when corpus is small

## Hook (`hooks/learn-from-edits.sh`)

PostToolUse hook on Edit. Silently logs diffs to `.interfluence/learnings-raw.log`. Fires only when:
1. The tool is `Edit` (not Write)
2. A `.interfluence/` dir exists in the project tree
3. The file is not excluded (CLAUDE.md, AGENTS.md, .interfluence/)
4. `learnFromEdits` is enabled in config (default: true)

No per-edit Claude call. Diffs are batch-reviewed during `/interfluence refine`.

## Command (`commands/interfluence.md`)

Routes `/interfluence <subcommand>` to the appropriate skill. Shows status overview when invoked with no args.
