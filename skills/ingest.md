---
description: Add writing samples to the Interfluence corpus. Use when the user says "ingest", "add writing sample", "analyze my writing from", "add my blog post", or provides a URL/path to their writing.
allowed-tools: mcp_interfluence_corpus_add, mcp_interfluence_corpus_add_text, mcp_interfluence_corpus_list, Read, WebFetch, Glob
---

# Interfluence: Ingest Writing Samples

You are ingesting writing samples into the Interfluence corpus for voice analysis.

## Process

1. **Determine the source type:**
   - **File path**: Read the file directly and use `corpus_add` with the file path
   - **Directory**: Glob for text/markdown files and ingest each one using `corpus_add`
   - **URL**: Use WebFetch to extract the text content, then use `corpus_add_text` with source "url"

2. **For URLs (especially Substack, blogs, Notion exports):**
   - Fetch the page and extract the main article text
   - Strip navigation, footers, comments, and other non-article content
   - Preserve the author's formatting: paragraph breaks, headers, lists, emphasis
   - Set the title from the page title or first heading

3. **After ingestion:**
   - Show the user what was added (title, word count, sample ID)
   - If this is the first sample, suggest running `/interfluence analyze` to generate a voice profile
   - If a voice profile already exists, suggest re-running analysis to incorporate the new sample

## Important
- The `projectDir` parameter should be the current working directory
- Always preserve the author's original text faithfully — do not clean up, edit, or summarize
- For directories, confirm with the user before ingesting many files
