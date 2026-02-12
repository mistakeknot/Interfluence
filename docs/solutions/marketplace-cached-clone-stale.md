---
title: "Marketplace plugin not visible after publishing"
category: plugin-publishing
severity: moderate
symptoms:
  - "Plugin not showing in marketplace install list"
  - "claude plugins install <name>@interagency-marketplace fails to find plugin"
  - "Marketplace JSON has the entry but Claude Code can't see it"
root_cause: "Claude Code reads from a cached clone, not the working copy"
date_discovered: 2026-02-11
tags: [marketplace, cache, git, plugin-publishing, interagency-marketplace]
---

# Marketplace Plugin Not Visible After Publishing

## Problem

After adding a new plugin entry to the interagency marketplace (`/root/projects/interagency-marketplace/.claude-plugin/marketplace.json`), committing, and pushing to GitHub, the plugin does not appear when running `claude plugins install <name>@interagency-marketplace`.

## Root Cause

Claude Code does **not** read from your local working copy of the marketplace repo at `/root/projects/interagency-marketplace/`. It reads from a **cached clone** at:

```
/home/claude-user/.claude/plugins/marketplaces/interagency-marketplace/
```

This cached clone is tracked in `/home/claude-user/.claude/plugins/known_marketplaces.json` with a `lastUpdated` timestamp. The cache is only refreshed when Claude Code explicitly updates it (e.g., on session start or marketplace refresh). If you push changes to the marketplace repo between cache refreshes, the cached clone falls behind.

## Solution

After pushing marketplace changes, pull the cached clone manually:

```bash
cd /home/claude-user/.claude/plugins/marketplaces/interagency-marketplace
git pull
```

Then the plugin will be visible for installation.

## Investigation Steps

1. Verified the entry existed in the working copy at `/root/projects/interagency-marketplace/` — confirmed present and pushed
2. Checked `known_marketplaces.json` — found the cached clone path and `lastUpdated` timestamp (predated our push)
3. Grepped for the plugin name in the cached clone — NOT FOUND
4. Ran `git pull` in the cached clone — entry appeared
5. Plugin became installable

## Prevention

Consider adding a step to `scripts/bump-version.sh` that also pulls the cached marketplace clone after pushing:

```bash
# After pushing marketplace changes
CACHED_MARKETPLACE="/home/claude-user/.claude/plugins/marketplaces/interagency-marketplace"
if [ -d "$CACHED_MARKETPLACE/.git" ]; then
    cd "$CACHED_MARKETPLACE" && git pull
    echo -e "${GREEN}Updated cached marketplace clone${NC}"
fi
```

## Related

- `known_marketplaces.json` — tracks all marketplace sources and their cache locations
- `installed_plugins.json` — tracks which plugins are installed and their versions
- `scripts/bump-version.sh` — version bump script that pushes to both repos
