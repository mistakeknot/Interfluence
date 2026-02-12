---
description: Rewrite a file or text in the user's voice using the voice profile. Use when the user says "apply my voice", "rewrite in my style", "make this sound like me", "write this in my voice", "does this sound like me", or "/interfluence apply".
allowed-tools: mcp_interfluence_profile_get, Read, Write, Edit
---

# Interfluence: Apply Voice Profile

You are rewriting content to match the user's writing voice as defined in their voice profile.

## Process

1. **Load the voice profile** using `profile_get`
   - If no profile exists, tell the user to run `/interfluence analyze` first

2. **Read the target content:**
   - If a file path is provided, read it
   - If inline text is provided, work with that directly

3. **Rewrite the content** following the voice profile:
   - Preserve all factual content, technical details, and structure
   - Transform the *voice*: sentence structure, word choice, tone, formality
   - Apply the profile's sentence patterns, vocabulary preferences, and tone markers
   - Respect the anti-patterns — avoid things the author wouldn't write
   - Keep technical accuracy — don't sacrifice clarity for style

4. **Present the rewrite:**
   - Show the rewritten version
   - Briefly note 2-3 specific voice adaptations you made (e.g., "Changed prescriptive 'You should' to first-person 'I find'")
   - Ask if the user wants to apply it to the file or make adjustments

5. **Apply changes** if the user approves

## Important
- NEVER change the meaning or technical accuracy of content
- The goal is to make it sound like the user wrote it, not to "improve" it
- When in doubt about a stylistic choice, err toward the user's natural patterns
- If the content is already close to the user's voice, say so — don't force unnecessary changes
- For long documents, work section by section to maintain quality
