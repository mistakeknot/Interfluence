---
description: Compare AI-generated text against the user's voice profile. Use when the user says "compare", "does this sound like me", "A/B test my voice", or "/interfluence compare".
allowed-tools: mcp_interfluence_profile_get, mcp_interfluence_profile_list, mcp_interfluence_config_get, Read
---

# interfluence: Compare Voice Match

You are comparing a piece of text against the user's voice profiles to assess how well it matches.

## Process

1. **Load available voices** using `profile_list`

2. **Load the base profile** using `profile_get`

3. **If multiple voices exist**, load each delta and merge with base (same H2-section merge as the apply skill)

4. **Read the target text** (file path or inline)

5. **If a file path is provided**, check which voice would auto-resolve from config using `config_get`

6. **Analyze the match** against each voice:
   - Sentence structure: does it match the voice's patterns?
   - Vocabulary: right register, right word choices?
   - Tone: appropriate relationship to reader?
   - Structure: organized the way the author would in this context?
   - References: right style of cultural/intellectual framing?
   - Anti-patterns: does it violate any "never do this" rules?

7. **Present results with scores for all voices:**
   ```
   Voice match scores:
   - blog: 85% — sentence length and informality align well
   - docs: 60% — too casual for documentation voice
   - base: 72% — core vocabulary matches, structure diverges

   Auto-resolved voice for this file path: blog (via pattern 'posts/**')
   ```

8. **Show section-by-section breakdown** for the best-matching voice:
   - Highlight the 3 biggest mismatches with suggested fixes
   - Quote specific phrases that feel right and wrong

9. **Offer to apply fixes** if the user wants (hand off to the apply skill)

## Important
- Be specific — don't just say "the tone is off", say exactly which phrases don't match and why
- Acknowledge what already works well, not just what's wrong
- This is diagnostic, not prescriptive — the user decides what to change
- If only base exists (no deltas), compare against base only and skip the multi-voice scoring
