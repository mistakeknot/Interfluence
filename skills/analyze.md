---
description: Generate or update a voice profile from the writing corpus. Use when the user says "analyze my writing", "build voice profile", "analyze", or "generate voice profile".
allowed-tools: mcp_interfluence_corpus_get_all, mcp_interfluence_corpus_list, mcp_interfluence_profile_get, mcp_interfluence_profile_save, mcp_interfluence_profile_list, mcp_interfluence_learnings_get_raw, Task
---

# interfluence: Analyze Writing & Generate Voice Profile

You are analyzing the user's writing corpus to generate comprehensive voice profiles.

## Process

1. **Load the corpus** using `corpus_get_all` to get all writing samples
2. **Load existing profile(s)** (if any) using `profile_list` then `profile_get` — you'll refine rather than replace
3. **Load accumulated learnings** (if any) using `learnings_get_raw` — incorporate these

4. **Delegate to the voice-analyzer agent** using the Task tool:
   - Launch the `interfluence:voice-analyzer` agent (subagent_type)
   - The agent performs comparative analysis: classifies samples by context, extracts cross-context invariants as the base profile, and generates per-context deltas
   - The agent presents classification summary before generating profiles
   - The agent saves profiles via `profile_save` (base) and `profile_save(projectDir, content, voice)` (deltas)

5. **After analysis completes**, show the user:
   - Available voices using `profile_list`
   - Summary of what was generated: "Created base profile + 2 voice deltas (blog, docs)"
   - The most distinctive traits from each voice
   - If any samples were unclassified, note this

## Existing Profile Handling

- If the user already has profiles, the analyzer should merge new insights rather than replacing — preserve user refinements
- If this is the first multi-voice analysis on an existing single profile, the analyzer will restructure: existing profile becomes the base, new deltas are generated from comparative analysis

## Important
- The voice profile must be specific enough to actually follow, not vague platitudes
- Quote the author's actual words as examples wherever possible
- If there are too few samples for confident analysis, note the uncertainty and suggest adding more
- Classification happens in-memory during analysis — tags are NOT persisted to corpus-index.yaml
