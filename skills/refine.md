---
description: Review and refine the voice profile interactively. Use when the user says "refine my voice profile", "update voice profile", "that's not how I'd say it", "adjust my style", or "/interfluence refine".
allowed-tools: mcp_interfluence_profile_get, mcp_interfluence_profile_save, mcp_interfluence_profile_list, mcp_interfluence_config_get, mcp_interfluence_learnings_get_raw, mcp_interfluence_learnings_clear_raw, Read, Edit
---

# interfluence: Refine Voice Profile

You are helping the user review and refine their voice profile through interactive dialogue.

## Process

1. **Load current state:**
   - Get available voices using `profile_list`
   - Get the base profile using `profile_get`
   - Get config using `config_get` (for voice routing patterns)
   - Get accumulated learnings using `learnings_get_raw`

2. **If there are accumulated learnings:**
   - Analyze the edit diffs to extract stylistic patterns
   - **Resolve context for each learning:** Learnings are tagged `CONTEXT:unknown`. Use the file path from each entry and match it against the current config's `voices` array (first match wins) to determine which context the learning belongs to.
   - Group learnings by resolved context (blog, docs, base/unresolved)
   - If any learnings can't be resolved, present them to the user: "3 learnings from unknown contexts — assign them to: [blog] [docs] [base] [skip]?"
   - For each pattern found, propose a voice profile update:
     - "Based on your edits to blog posts, you seem to prefer X over Y. Should I add this to the **blog** voice?"
     - "This pattern appears across contexts — should it go in the **base** profile?"
   - Present proposed updates for user approval

3. **Show the current profile(s)** and ask the user what they'd like to adjust:
   - Show which voices exist (base, blog, docs, etc.)
   - Are there patterns that feel wrong or overstated?
   - Are there voice traits missing from the profile?
   - Any specific "never do this" rules to add?
   - Should any refinement apply to a specific voice or the base?

4. **For each refinement:**
   - Show the before/after for the relevant profile section
   - Clarify which voice it applies to (base affects all contexts, delta affects only that context)
   - Confirm with the user before saving

5. **Save the updated profile(s):**
   - Base updates: `profile_save(projectDir, content)`
   - Voice delta updates: `profile_save(projectDir, content, "<voice>")`

6. **Clear processed learnings** using `learnings_clear_raw`

7. **Optionally demonstrate** the refined profile by showing a before/after of a short passage

## Important
- The user's explicit preferences always override automated learnings
- Don't consolidate or remove profile entries without asking
- Keep the profile readable and specific — resist vague generalizations
- If the user says "that's not how I'd say it" about specific text, extract the lesson and add it
- When adding to a delta vs base, ask: "Does this apply everywhere, or just in [context]?"
