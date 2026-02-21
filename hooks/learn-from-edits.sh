#!/bin/bash
# PostToolUse:Edit hook: logs edit diffs for voice profile learning
#
# This hook fires after Edit tool calls and silently logs
# the changes to learnings-raw.log for later batch review.
#
# It checks:
# 1. The tool is Edit (matcher handles this in hooks.json)
# 2. An .interfluence directory exists in the project
# 3. The file is in scope per config (not excluded)
# 4. learnFromEdits is enabled in config
#
# Input: Hook JSON on stdin (tool_input.file_path, tool_input.old_string, tool_input.new_string)
# Output: none
# Exit: 0 always

# Read hook input from stdin (Claude Code hook protocol)
INPUT=$(cat)

# Extract fields from tool_input JSON
FILE_PATH="$(printf '%s' "$INPUT" | jq -r '(.tool_input.file_path // "")' 2>/dev/null || printf '')"
OLD_STRING="$(printf '%s' "$INPUT" | jq -r '(.tool_input.old_string // "")' 2>/dev/null || printf '')"
NEW_STRING="$(printf '%s' "$INPUT" | jq -r '(.tool_input.new_string // "")' 2>/dev/null || printf '')"

# Guard: need a file path at minimum
if [ -z "$FILE_PATH" ] || [ "$FILE_PATH" = "null" ]; then
  exit 0
fi

# Find .interfluence dir by walking up from the file
DIR=$(dirname "$FILE_PATH")
INTERFLUENCE_DIR=""
while [ "$DIR" != "/" ]; do
  if [ -d "$DIR/.interfluence" ]; then
    INTERFLUENCE_DIR="$DIR/.interfluence"
    break
  fi
  DIR=$(dirname "$DIR")
done

if [ -z "$INTERFLUENCE_DIR" ]; then
  exit 0
fi

# Check if learning is enabled
CONFIG_FILE="$INTERFLUENCE_DIR/config.yaml"
if [ -f "$CONFIG_FILE" ]; then
  LEARN_ENABLED=$(grep -E "^learnFromEdits:" "$CONFIG_FILE" | awk '{print $2}')
  if [ "$LEARN_ENABLED" = "false" ]; then
    exit 0
  fi
fi

# Check exclusions
RELATIVE_PATH="${FILE_PATH#$DIR/}"
if echo "$RELATIVE_PATH" | grep -qE "^(CLAUDE\.md|AGENTS\.md|\.interfluence/)"; then
  exit 0
fi

# Log the diff
LOG_FILE="$INTERFLUENCE_DIR/learnings-raw.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Append log entry
{
  printf '\n--- %s | %s | CONTEXT:unknown ---\n' "$TIMESTAMP" "$RELATIVE_PATH"
  printf 'OLD: %s\n' "$OLD_STRING"
  printf 'NEW: %s\n' "$NEW_STRING"
} >> "$LOG_FILE"
