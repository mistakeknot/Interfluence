import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, statSync } from "fs";
import { join, basename, extname } from "path";
import { getCorpusDir } from "../utils/paths.js";
import {
  loadCorpusIndex,
  saveCorpusIndex,
  generateSampleId,
  type CorpusSample,
} from "../utils/corpus-index.js";

export function registerCorpusTools(server: McpServer): void {
  server.tool(
    "corpus_add",
    "Add a writing sample to the corpus from a file path. Returns the sample ID.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      filePath: z.string().describe("Absolute path to the file to ingest"),
      title: z.string().optional().describe("Optional title for the sample"),
      tags: z.array(z.string()).optional().describe("Optional tags for categorization"),
    },
    async ({ projectDir, filePath, title, tags }) => {
      const corpusDir = getCorpusDir(projectDir);
      const index = loadCorpusIndex(projectDir);

      const content = readFileSync(filePath, "utf-8");
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const id = generateSampleId();
      const ext = extname(filePath) || ".md";
      const filename = `${id}${ext}`;

      writeFileSync(join(corpusDir, filename), content, "utf-8");

      const sample: CorpusSample = {
        id,
        filename,
        source: "file",
        sourcePath: filePath,
        title: title || basename(filePath, ext),
        addedAt: new Date().toISOString(),
        wordCount,
        analyzed: false,
        tags,
      };

      index.samples.push(sample);
      saveCorpusIndex(projectDir, index);

      return {
        content: [
          {
            type: "text" as const,
            text: `Added sample "${sample.title}" (${id})\n- Words: ${wordCount}\n- Stored as: ${filename}`,
          },
        ],
      };
    },
  );

  server.tool(
    "corpus_add_text",
    "Add a writing sample from raw text content. Use this for URL-fetched content or clipboard pastes.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      text: z.string().describe("The text content to add as a sample"),
      title: z.string().describe("Title for the sample"),
      source: z.enum(["url", "clipboard", "inline"]).describe("Where this text came from"),
      sourceUrl: z.string().optional().describe("Source URL if applicable"),
      tags: z.array(z.string()).optional().describe("Optional tags for categorization"),
    },
    async ({ projectDir, text, title, source, sourceUrl, tags }) => {
      const corpusDir = getCorpusDir(projectDir);
      const index = loadCorpusIndex(projectDir);

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const id = generateSampleId();
      const filename = `${id}.md`;

      writeFileSync(join(corpusDir, filename), text, "utf-8");

      const sample: CorpusSample = {
        id,
        filename,
        source,
        sourceUrl,
        title,
        addedAt: new Date().toISOString(),
        wordCount,
        analyzed: false,
        tags,
      };

      index.samples.push(sample);
      saveCorpusIndex(projectDir, index);

      return {
        content: [
          {
            type: "text" as const,
            text: `Added sample "${title}" (${id})\n- Words: ${wordCount}\n- Source: ${source}${sourceUrl ? ` (${sourceUrl})` : ""}\n- Stored as: ${filename}`,
          },
        ],
      };
    },
  );

  server.tool(
    "corpus_list",
    "List all writing samples in the corpus with metadata.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const index = loadCorpusIndex(projectDir);

      if (index.samples.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No samples in corpus. Use corpus_add or corpus_add_text to add writing samples.",
            },
          ],
        };
      }

      const totalWords = index.samples.reduce((sum, s) => sum + s.wordCount, 0);
      const lines = [
        `Corpus: ${index.samples.length} samples, ${totalWords.toLocaleString()} total words\n`,
      ];

      for (const sample of index.samples) {
        const analyzed = sample.analyzed ? "analyzed" : "pending";
        const tags = sample.tags?.length ? ` [${sample.tags.join(", ")}]` : "";
        lines.push(
          `- ${sample.id}: "${sample.title}" (${sample.wordCount} words, ${analyzed})${tags}`,
        );
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    },
  );

  server.tool(
    "corpus_get",
    "Get the full text of a specific writing sample.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      sampleId: z.string().describe("The sample ID to retrieve"),
    },
    async ({ projectDir, sampleId }) => {
      const index = loadCorpusIndex(projectDir);
      const sample = index.samples.find((s) => s.id === sampleId);

      if (!sample) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Sample "${sampleId}" not found. Use corpus_list to see available samples.`,
            },
          ],
        };
      }

      const corpusDir = getCorpusDir(projectDir);
      const content = readFileSync(join(corpusDir, sample.filename), "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: `# ${sample.title}\n\nSource: ${sample.source}${sample.sourceUrl ? ` (${sample.sourceUrl})` : ""}\nWords: ${sample.wordCount}\nAdded: ${sample.addedAt}\n\n---\n\n${content}`,
          },
        ],
      };
    },
  );

  server.tool(
    "corpus_remove",
    "Remove a writing sample from the corpus.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      sampleId: z.string().describe("The sample ID to remove"),
    },
    async ({ projectDir, sampleId }) => {
      const index = loadCorpusIndex(projectDir);
      const sampleIdx = index.samples.findIndex((s) => s.id === sampleId);

      if (sampleIdx === -1) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Sample "${sampleId}" not found.`,
            },
          ],
        };
      }

      const sample = index.samples[sampleIdx];
      const corpusDir = getCorpusDir(projectDir);
      const filePath = join(corpusDir, sample.filename);

      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      index.samples.splice(sampleIdx, 1);
      saveCorpusIndex(projectDir, index);

      return {
        content: [
          {
            type: "text" as const,
            text: `Removed sample "${sample.title}" (${sampleId})`,
          },
        ],
      };
    },
  );

  server.tool(
    "corpus_get_all",
    "Get all writing samples concatenated for analysis. Use this when generating a voice profile.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const index = loadCorpusIndex(projectDir);
      const corpusDir = getCorpusDir(projectDir);

      if (index.samples.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No samples in corpus.",
            },
          ],
        };
      }

      const parts: string[] = [];
      for (const sample of index.samples) {
        const content = readFileSync(
          join(corpusDir, sample.filename),
          "utf-8",
        );
        parts.push(`--- SAMPLE: ${sample.title} (${sample.id}) ---\n\n${content}`);
      }

      const totalWords = index.samples.reduce((sum, s) => sum + s.wordCount, 0);

      return {
        content: [
          {
            type: "text" as const,
            text: `${index.samples.length} samples, ${totalWords.toLocaleString()} total words\n\n${parts.join("\n\n")}`,
          },
        ],
      };
    },
  );
}
