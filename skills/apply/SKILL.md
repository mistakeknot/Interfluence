---
description: Rewrite a file or text in the user's voice using the voice profile. Use when the user says "apply my voice", "rewrite in my style", "make this sound like me", "write this in my voice", "does this sound like me", or "/interfluence apply".
allowed-tools: mcp_interfluence_profile_get, mcp_interfluence_profile_list, mcp_interfluence_config_get, Read, Write, Edit
---

# interfluence: Apply Voice Profile

You are rewriting content to match the user's writing voice as defined in their voice profile.

## Process

1. **Resolve which voice to use:**
   - If the user provides `--voice=<name>`, use that voice
   - Otherwise, load config via `config_get` and check if it has a `voices` array
   - If it does, match the target file path against the voice patterns in order (first match wins)
   - If no match or no voices configured, use the base profile only

2. **Load the voice profile:**
   - Load the base profile: `profile_get(projectDir)`
   - If using a named voice (not base), also load the delta: `profile_get(projectDir, "<voice>")`
   - **Merge:** The delta's H2 sections override matching H2 sections in the base (matched by section title). Base sections without a matching delta section are kept as-is. Delta sections without a matching base section are appended.

3. **Read the target content:**
   - If a file path is provided, read it
   - If inline text is provided, work with that directly

4. **Rewrite the content** following the merged voice profile:
   - Preserve all factual content, technical details, and structure
   - Transform the *voice*: sentence structure, word choice, tone, formality
   - Apply the profile's sentence patterns, vocabulary preferences, and tone markers
   - Respect the anti-patterns — avoid things the author wouldn't write
   - Keep technical accuracy — don't sacrifice clarity for style

5. **Present the rewrite:**
   - Report which voice was used and why: "Applied blog voice to posts/new-post.md (matched pattern 'posts/**')" or "Applied base voice (no matching pattern found)"
   - Show the rewritten version
   - Briefly note 2-3 specific voice adaptations you made (e.g., "Changed prescriptive 'You should' to first-person 'I find'")
   - Ask if the user wants to apply it to the file or make adjustments

6. **Apply changes** if the user approves

## H2 Section Merge Algorithm

When merging base + delta profiles:

1. Parse both into H2-keyed sections: `## Section Title` → everything until the next `##` or EOF
2. Start with all base sections in order
3. For each delta section: if a base section has the same `## Title`, replace it. If not, append the delta section at the end.
4. The merged result is your working voice profile for this rewrite.

## Important
- NEVER change the meaning or technical accuracy of content
- The goal is to make it sound like the user wrote it, not to "improve" it
- When in doubt about a stylistic choice, err toward the user's natural patterns
- If the content is already close to the user's voice, say so — don't force unnecessary changes
- For long documents, work section by section to maintain quality
