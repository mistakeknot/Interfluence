# interfluence — Vision and Philosophy

**Version:** 0.1.0
**Last updated:** 2026-02-28

## What interfluence Is

interfluence is a voice profile plugin for Claude Code. It ingests your writing samples, runs a literary analysis agent against the corpus, and produces a prose voice profile that Claude can apply when generating any human-facing text. The result is AI-produced documentation, commit messages, and copy that sounds like you rather than like a helpful assistant who has read too many style guides.

The profile is prose, not numbers. "Uses absurdist humor through hyper-specific examples and drops cultural references without explaining them" is something Claude can follow. "formality: 0.6" is not. The voice analyzer — an Opus-based literary analysis agent — reads your corpus the way a close reader would: looking for rhythms, characteristic moves, vocabulary preferences, and anti-patterns. It produces a base profile of cross-context invariants, plus per-context deltas for when your blog voice and your docs voice diverge.

## Why This Exists

AI writing tools default to a generic helpful-assistant register. That register is legible and inoffensive, which makes it wrong for nearly everyone. Documentation sounds like documentation. READMEs sound like READMEs. Nothing sounds like the person who actually runs the project. interfluence treats voice consistency as a first-class problem: evidence-based (the profile is built from your actual corpus, not from sliders), progressive (the learn-from-edits hook accumulates what you keep fixing), and always under your control (batch review, not real-time mutation).

## Design Principles

1. **Evidence earns the profile.** Voice profiles are not configured — they are earned from corpus analysis. More samples, richer analysis, better output. A profile with no corpus behind it is just a guess.

2. **Prose instructions, not numeric scores.** The natural-language voice profile is Claude's native interface. Fighting it with feature vectors produces worse results and harder-to-debug behavior. Every profile section includes quotes from the corpus and "do this / not this" transformation pairs.

3. **Batched learning, explicit control.** The PostToolUse hook logs edit diffs silently. You review and fold them into the profile during `/interfluence refine`. The profile never mutates under you; you always approve what it learns.

4. **Manual mode first.** Auto-apply is available but off by default. Run `/interfluence compare` to calibrate how aggressive the restyling is before automating it. Verify the vibes before trusting them.

5. **Server is a filing cabinet, Claude is the analyst.** The MCP server handles corpus storage, profile CRUD, config, and learnings. All NLP lives in the agent layer. The split keeps the server thin, testable, and portable.

## Scope

**What interfluence does:**
- Ingests writing samples (files, directories) into a per-project corpus
- Runs a voice analyzer agent that produces a prose profile covering sentence structure, vocabulary, tone, cultural references, and anti-patterns
- Applies the active voice profile to any AI-generated content on request
- Logs edit diffs passively and folds them into the profile during explicit refinement sessions
- Supports per-context voice deltas (blog vs. docs vs. commit messages) via code-switching

**What interfluence does not do:**
- Global voice profiles — each project has its own `.interfluence/` directory
- Real-time profile mutation — learning is always batched and reviewed
- Numeric style scoring — the profile is prose, not a feature vector
- Automatic text rewriting without explicit invocation (unless the user opts into auto mode)

## Direction

- Per-context sub-profiles are the near-term priority: a blog voice delta, a commit message delta, and a Slack voice delta, each overriding only the sections where the context differs from the base
- Confidence signaling: the analyzer should surface when a pattern appears in only one or two samples versus across the full corpus, so users know which profile sections are load-bearing and which are speculative
- Cross-project voice sharing: an explicit export/import mechanism so users can seed a new project's profile from an existing one rather than starting from scratch
