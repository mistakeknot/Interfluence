#!/bin/bash
# PostToolUse hook: logs edit diffs for voice profile learning
#
# This hook fires after Edit/Write tool calls and silently logs
# the changes to learnings-raw.log for later batch review.
#
# It checks:
# 1. The tool is Edit (not Write — Write is full file creation, less useful for style learning)
# 2. An .interfluence directory exists in the project
# 3. The file is in scope per config (not excluded)
# 4. learnFromEdits is enabled in config

TOOL_NAME="$CLAUDE_TOOL_NAME"
FILE_PATH="$CLAUDE_TOOL_INPUT_FILE_PATH"
OLD_STRING="$CLAUDE_TOOL_INPUT_OLD_STRING"
NEW_STRING="$CLAUDE_TOOL_INPUT_NEW_STRING"

# Only trigger on Edit tool
if [ "$TOOL_NAME" != "Edit" ]; then
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

cat >> "$LOG_FILE" << ENTRY

--- ${TIMESTAMP} | ${RELATIVE_PATH} | CONTEXT:unknown ---
OLD: ${OLD_STRING}
NEW: ${NEW_STRING}
ENTRY
