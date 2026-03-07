# Per-Project Data Layout

When a user runs `/interfluence ingest` in their project, this structure is created:

```
their-project/
└── .interfluence/
    ├── voice-profile.md      # Base voice — cross-context authorial DNA (invariants)
    ├── voices/               # Per-context voice deltas (override specific H2 sections)
    │   ├── blog.md           # Blog post voice overrides
    │   └── docs.md           # Documentation voice overrides
    ├── config.yaml           # mode, scope, exclusions, voices (glob->voice routing)
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
