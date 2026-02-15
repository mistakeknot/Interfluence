# interfluence

A Claude Code plugin that learns how you write and makes Claude sound like you.

## What This Is

I find that Claude is excellent at generating documentation, READMEs, commit messages, and all the other text artifacts that accrue around a software project — but it doesn't sound like *me*. It sounds like a helpful, slightly over-eager assistant who has read too many style guides and not enough actual blog posts. interfluence fixes that.

You feed it samples of your writing (blog posts, docs, even emails if you're feeling brave), it builds a voice profile, and then you can apply that profile to anything Claude generates. The profile is prose, not numbers — turns out Claude follows "use em dashes for mid-sentence pivots and drop cultural references without explaining them" much better than "formality: 0.6, humor: 0.4."

## How It Works

The plugin has an MCP server that handles all the boring file management (corpus storage, profile CRUD, config), and Claude does all the actual NLP. This is a deliberate split: the server is a filing cabinet, Claude is the literary analyst. The voice analyzer runs on Opus and produces genuinely interesting analysis — it picks up on things like your relationship to parenthetical asides, whether you tend to front-load or back-load your punchlines, and which cultural references you reach for when you need a metaphor.

There's also a passive learning hook that quietly logs your edit diffs whenever you change something Claude wrote. Over time, those diffs tell interfluence what you keep fixing — and the next time you run `/interfluence refine`, it folds those patterns back into your profile. Capability is forged, not absorbed; the profile gets better as you use it.

## Getting Started

Install from the interagency marketplace:

```
/plugin install interfluence
```

Then:

1. **Ingest your writing**: `/interfluence ingest` — point it at files, directories, or URLs. More samples means a better profile, but even a single long blog post gives it enough to work with.

2. **Analyze**: `/interfluence analyze` — this runs the voice analyzer agent, which reads your entire corpus and produces a detailed prose profile covering sentence structure, vocabulary, tone, cultural references, and anti-patterns (things your voice would *never* do).

3. **Apply**: `/interfluence apply` — take any AI-generated content and rewrite it in your voice. You can also run `/interfluence compare` to see the original and voice-adapted versions side by side, which is helpful for calibrating how aggressive you want the restyling to be.

## Architecture

```
.claude-plugin/plugin.json   → Plugin manifest + MCP server declaration
server/src/                  → MCP server (corpus CRUD, profile, config, learnings)
skills/                      → ingest, analyze, apply, refine, compare
agents/                      → voice-analyzer (Opus, deep literary analysis)
hooks/                       → learn-from-edits.sh (PostToolUse on Edit)
commands/                    → /interfluence router
```

Per-project data lives in `.interfluence/` — voice profile, config, corpus, and the raw learnings log. Nothing is stored globally; each project can have its own voice (or share one, if you copy the profile over).

## Configuration

Manual mode by default — you explicitly call `/interfluence apply` when you want it. If you trust the profile enough to let it run automatically:

```yaml
# .interfluence/config.yaml
mode: auto
autoApplyTo:
  - "*.md"
  - "docs/**"
```

But I'd recommend starting in manual mode and running `/interfluence compare` a few times first. In this house, we believe in verifying the vibes before automating them.

## Design Decisions

A few choices worth calling out:

- **Prose profiles, not numeric scores.** Claude follows "favor medium-to-long sentences with natural clause stacking" better than "sentence_length: 0.7." Natural language instructions are the native interface; why fight it?

- **Batched learning, not real-time.** The edit hook logs diffs silently. You review them during `/interfluence refine` rather than having the profile mutate under you. This keeps the profile stable and predictable — you're always in control of what it learns.

- **TypeScript MCP server, bundled with esbuild.** The server is a single 1.2MB bundle committed to the repo. No build step runs during plugin install. If you're curious about why this matters, try installing a Claude Code plugin that expects `npm install` to run during setup (spoiler: it doesn't).

## What's Next

Context-specific sub-profiles (your docs voice vs. your commit message voice vs. your Slack voice) are on the roadmap. For now, one profile per project.

If you have questions, recommendations, or feedback, feel free to reach out.
