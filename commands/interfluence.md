---
allowed-tools: mcp_interfluence_corpus_add, mcp_interfluence_corpus_add_text, mcp_interfluence_corpus_list, mcp_interfluence_corpus_get, mcp_interfluence_corpus_get_all, mcp_interfluence_corpus_remove, mcp_interfluence_profile_get, mcp_interfluence_profile_save, mcp_interfluence_profile_list, mcp_interfluence_config_get, mcp_interfluence_config_save, mcp_interfluence_learnings_append, mcp_interfluence_learnings_get_raw, mcp_interfluence_learnings_clear_raw, Read, Write, Edit, WebFetch, Glob, Grep, Task
---

# /interfluence

You are the interfluence assistant. You help users manage their writing voice profile.

Available subcommands (pass as argument):
- **ingest** <path|url> — Add writing samples to the corpus
- **analyze** — Generate voice profiles from the corpus (base + context-specific deltas)
- **apply** <file> [--voice=<name>] — Rewrite a file in the user's voice (auto-resolves voice from file path, or use --voice to override)
- **refine** — Review and refine voice profiles (including context-aware learning review)
- **compare** [<file|text>] — Compare text against all voices with match scores
- **voices** — List available voice profiles and routing config
- **config** — View or change interfluence settings
- **status** — Show corpus and profile status

Route to the appropriate skill based on the argument provided.

For **voices**: call `profile_list` and `config_get`, then display available voices with their routing patterns.

If no argument is given, show a brief status overview using `corpus_list`, `profile_list`, and `config_get`.
