---
description: Compare AI-generated text against the user's voice profile. Use when the user says "compare", "does this sound like me", "A/B test my voice", or "/interfluence compare".
allowed-tools: mcp_interfluence_profile_get, Read
---

# interfluence: Compare Voice Match

You are comparing a piece of text against the user's voice profile to assess how well it matches.

## Process

1. **Load the voice profile** using `profile_get`

2. **Read the target text** (file path or inline)

3. **Analyze the match** across each voice profile dimension:
   - Sentence structure: does it match the user's patterns?
   - Vocabulary: right register, right word choices?
   - Tone: appropriate relationship to reader?
   - Structure: organized the way the user would organize it?
   - References: right style of cultural/intellectual framing?
   - Anti-patterns: does it violate any "never do this" rules?

4. **Present results:**
   - Overall assessment (brief)
   - Section-by-section breakdown with specific examples
   - Highlight the 3 biggest mismatches with suggested fixes
   - Quote specific phrases that feel right and wrong

5. **Offer to apply fixes** if the user wants

## Important
- Be specific — don't just say "the tone is off", say exactly which phrases don't match and why
- Acknowledge what already works well, not just what's wrong
- This is diagnostic, not prescriptive — the user decides what to change
