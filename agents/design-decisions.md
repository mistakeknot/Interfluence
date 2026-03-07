# Design Decisions

| Decision | Rationale |
|----------|-----------|
| TypeScript MCP server | Plugin ecosystem standard; NLP is done by Claude, not locally |
| Prose voice profiles | Claude follows "uses em-dashes for asides" better than "punctuation_variety: 0.8" |
| Batched learning | No per-edit latency/tokens; higher signal when batch-reviewed |
| Manual mode default | Avoids surprising users; auto mode is opt-in |
| Multi-voice profiles | Base profile = cross-context invariants; named deltas override H2 sections per context. Filesystem is source of truth for voice existence; config is routing only |
| `projectDir` on every tool call | Plugin serves data for the target project, not itself |
