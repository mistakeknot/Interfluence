---
description: Generate or update a voice profile from the writing corpus. Use when the user says "analyze my writing", "build voice profile", "analyze", or "generate voice profile".
allowed-tools: mcp_interfluence_corpus_get_all, mcp_interfluence_corpus_list, mcp_interfluence_profile_get, mcp_interfluence_profile_save, mcp_interfluence_learnings_get_raw, Task
---

# Interfluence: Analyze Writing & Generate Voice Profile

You are analyzing the user's writing corpus to generate a comprehensive voice profile.

## Process

1. **Load the corpus** using `corpus_get_all` to get all writing samples
2. **Load existing profile** (if any) using `profile_get` — you'll refine rather than replace
3. **Load accumulated learnings** (if any) using `learnings_get_raw` — incorporate these

4. **Analyze the writing across these dimensions:**

### Sentence Structure
- Average sentence length and variation
- Use of parenthetical asides, em-dashes, semicolons
- How paragraphs open (first-person, declarative, question, etc.)
- Characteristic sentence patterns

### Vocabulary & Diction
- Formality level and register
- Use of contractions
- Technical vocabulary handling (defined? assumed? casual?)
- Coined words, neologisms, wordplay
- Words/phrases the author clearly favors
- Words/phrases the author clearly avoids

### Tone & Voice
- Relationship to reader (peer, teacher, authority, friend)
- Use of humor and what kind (dry, absurdist, self-deprecating, none)
- Confidence style (assertive, hedging, exploratory)
- Emotional range and expressiveness
- Use of "I" vs "we" vs "you" vs passive voice

### Structure Patterns
- How pieces are organized (chronological, thematic, argumentative)
- Use of headers, lists, bullets
- Opening and closing patterns
- Transition style between sections

### Cultural & Reference Style
- Types of references (academic, pop culture, literary, technical)
- How references are integrated (epigraphs, asides, analogies)
- Attribution style (generous, minimal, formal)

### Anti-Patterns
- Things the author clearly does NOT do
- Stylistic choices that would feel wrong in their voice

5. **Generate the voice profile** as a markdown document with the sections above
   - Use prose descriptions, not numeric scores
   - Include specific examples from the corpus (quote them)
   - Include example transformations: "Write X, not Y"
   - Make it readable by both humans and Claude

6. **Save the profile** using `profile_save`

7. **Present a summary** to the user highlighting the most distinctive traits

## Important
- The voice profile must be specific enough to actually follow, not vague platitudes
- Quote the author's actual words as examples wherever possible
- If there are too few samples for confident analysis, note the uncertainty and suggest adding more
- If a profile already exists, merge new insights rather than replacing — preserve user refinements
