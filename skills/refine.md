---
description: Review and refine the voice profile interactively. Use when the user says "refine my voice profile", "update voice profile", "that's not how I'd say it", "adjust my style", or "/interfluence refine".
allowed-tools: mcp_interfluence_profile_get, mcp_interfluence_profile_save, mcp_interfluence_learnings_get_raw, mcp_interfluence_learnings_clear_raw, Read, Edit
---

# Interfluence: Refine Voice Profile

You are helping the user review and refine their voice profile through interactive dialogue.

## Process

1. **Load current state:**
   - Get the voice profile using `profile_get`
   - Get accumulated learnings using `learnings_get_raw`

2. **If there are accumulated learnings:**
   - Analyze the edit diffs to extract stylistic patterns
   - For each pattern found, propose a voice profile update:
     - "Based on your edits, you seem to prefer X over Y. Should I add this to your profile?"
   - Group similar learnings together
   - Present proposed updates for user approval

3. **Show the current profile** and ask the user what they'd like to adjust:
   - Are there patterns that feel wrong or overstated?
   - Are there voice traits missing from the profile?
   - Any specific "never do this" rules to add?

4. **For each refinement:**
   - Show the before/after for the relevant profile section
   - Confirm with the user before saving

5. **Save the updated profile** using `profile_save`

6. **Clear processed learnings** using `learnings_clear_raw`

7. **Optionally demonstrate** the refined profile by showing a before/after of a short passage

## Important
- The user's explicit preferences always override automated learnings
- Don't consolidate or remove profile entries without asking
- Keep the profile readable and specific — resist vague generalizations
- If the user says "that's not how I'd say it" about specific text, extract the lesson and add it
