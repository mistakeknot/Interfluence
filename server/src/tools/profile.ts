import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "fs";
import {
  getVoiceProfilePath,
  getConfigPath,
  getLearningsRawPath,
  getLearningsPath,
  getVoicesDir,
  isValidVoiceName,
  listVoices,
} from "../utils/paths.js";
import yaml from "js-yaml";
import { VoiceConfig } from "../utils/voice-resolution.js";

export interface interfluenceConfig {
  mode: "auto" | "manual";
  autoApplyTo: string[];
  exclude: string[];
  learnFromEdits: boolean;
  voices?: VoiceConfig[];
}

const DEFAULT_CONFIG: interfluenceConfig = {
  mode: "manual",
  autoApplyTo: ["*.md", "CHANGELOG*", "docs/**"],
  exclude: ["CLAUDE.md", "AGENTS.md", ".interfluence/**"],
  learnFromEdits: true,
};

export function registerProfileTools(server: McpServer): void {
  server.tool(
    "profile_get",
    "Get a voice profile. Without voice param, returns the base profile. With voice param, returns the named voice delta.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      voice: z.string().optional().describe("Voice name (e.g. 'blog', 'docs'). Omit for base profile."),
    },
    async ({ projectDir, voice }) => {
      if (voice && voice !== "base" && !isValidVoiceName(voice)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid voice name "${voice}". Use lowercase alphanumeric and hyphens, 2-32 characters.`,
            },
          ],
        };
      }

      const profilePath = getVoiceProfilePath(projectDir, voice);

      if (!existsSync(profilePath)) {
        const label = voice && voice !== "base" ? `Voice profile "${voice}"` : "Base voice profile";
        return {
          content: [
            {
              type: "text" as const,
              text: `${label} does not exist. ${voice && voice !== "base" ? `Expected at: ${profilePath}` : "Use /interfluence analyze to generate one from your corpus."}`,
            },
          ],
        };
      }

      const content = readFileSync(profilePath, "utf-8");
      return {
        content: [{ type: "text" as const, text: content }],
      };
    },
  );

  server.tool(
    "profile_save",
    "Save or update a voice profile. Without voice param, saves the base profile. With voice param, saves a voice delta to voices/ directory.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      content: z.string().describe("The full voice profile markdown content"),
      voice: z.string().optional().describe("Voice name (e.g. 'blog', 'docs'). Omit for base profile."),
    },
    async ({ projectDir, content, voice }) => {
      if (voice && voice !== "base" && !isValidVoiceName(voice)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid voice name "${voice}". Use lowercase alphanumeric and hyphens, 2-32 characters.`,
            },
          ],
        };
      }

      const profilePath = getVoiceProfilePath(projectDir, voice);

      // Create voices/ directory if saving a named voice
      if (voice && voice !== "base") {
        const voicesDir = getVoicesDir(projectDir);
        if (!existsSync(voicesDir)) {
          mkdirSync(voicesDir, { recursive: true });
        }
      }

      writeFileSync(profilePath, content, "utf-8");

      const label = voice && voice !== "base" ? `Voice profile "${voice}"` : "Base voice profile";
      return {
        content: [
          {
            type: "text" as const,
            text: `${label} saved to ${profilePath}`,
          },
        ],
      };
    },
  );

  server.tool(
    "profile_list",
    "List all available voice profiles. Returns base + any voices from the voices/ directory. Warns about config/filesystem mismatches.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const voices = listVoices(projectDir);

      // Check for config/filesystem reconciliation warnings
      const warnings: string[] = [];
      const configPath = getConfigPath(projectDir);
      if (existsSync(configPath)) {
        const config = yaml.load(readFileSync(configPath, "utf-8")) as interfluenceConfig;
        if (config.voices) {
          for (const vc of config.voices) {
            if (!voices.includes(vc.name)) {
              warnings.push(
                `Warning: Config references voice "${vc.name}" but voices/${vc.name}.md not found`,
              );
            }
          }
          const configNames = config.voices.map((v) => v.name);
          for (const v of voices) {
            if (v !== "base" && !configNames.includes(v)) {
              warnings.push(
                `Info: Voice file "${v}" exists but has no routing in config (won't auto-resolve from file paths)`,
              );
            }
          }
        }
      }

      let text = `Available voices: ${JSON.stringify(voices)}`;
      if (warnings.length > 0) {
        text += "\n\n" + warnings.join("\n");
      }

      return {
        content: [{ type: "text" as const, text }],
      };
    },
  );

  server.tool(
    "config_get",
    "Get the current interfluence configuration.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const configPath = getConfigPath(projectDir);

      let config: interfluenceConfig;
      if (existsSync(configPath)) {
        config = yaml.load(readFileSync(configPath, "utf-8")) as interfluenceConfig;
      } else {
        config = DEFAULT_CONFIG;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: yaml.dump(config, { lineWidth: 120 }),
          },
        ],
      };
    },
  );

  server.tool(
    "config_save",
    "Save the interfluence configuration. The voices array replaces the entire voices config (not merged) to preserve ordering.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      mode: z.enum(["auto", "manual"]).optional(),
      autoApplyTo: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      learnFromEdits: z.boolean().optional(),
      voices: z
        .array(
          z.object({
            name: z.string().describe("Voice name (alphanumeric + hyphens)"),
            applyTo: z.array(z.string()).describe("Glob patterns for file matching"),
          }),
        )
        .optional()
        .describe("Ordered array of voice configs. Replaces entire voices array if provided."),
    },
    async ({ projectDir, mode, autoApplyTo, exclude, learnFromEdits, voices }) => {
      const configPath = getConfigPath(projectDir);

      let config: interfluenceConfig;
      if (existsSync(configPath)) {
        config = yaml.load(readFileSync(configPath, "utf-8")) as interfluenceConfig;
      } else {
        config = { ...DEFAULT_CONFIG };
      }

      if (mode !== undefined) config.mode = mode;
      if (autoApplyTo !== undefined) config.autoApplyTo = autoApplyTo;
      if (exclude !== undefined) config.exclude = exclude;
      if (learnFromEdits !== undefined) config.learnFromEdits = learnFromEdits;
      if (voices !== undefined) config.voices = voices;

      writeFileSync(configPath, yaml.dump(config, { lineWidth: 120 }), "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: `Configuration saved:\n${yaml.dump(config, { lineWidth: 120 })}`,
          },
        ],
      };
    },
  );

  server.tool(
    "learnings_append",
    "Append a raw learning entry from an observed edit diff. Used by the learning hook.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      filePath: z.string().describe("Path to the file that was edited"),
      diff: z.string().describe("The diff or description of what changed"),
      timestamp: z.string().optional().describe("ISO timestamp, defaults to now"),
    },
    async ({ projectDir, filePath, diff, timestamp }) => {
      const logPath = getLearningsRawPath(projectDir);
      const ts = timestamp || new Date().toISOString();
      const entry = `\n--- ${ts} | ${filePath} ---\n${diff}\n`;

      appendFileSync(logPath, entry, "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: `Learning logged from edit to ${filePath}`,
          },
        ],
      };
    },
  );

  server.tool(
    "learnings_get_raw",
    "Get all raw learning entries for review during /interfluence refine.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const logPath = getLearningsRawPath(projectDir);

      if (!existsSync(logPath)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No learnings recorded yet.",
            },
          ],
        };
      }

      const content = readFileSync(logPath, "utf-8");
      if (!content.trim()) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No learnings recorded yet.",
            },
          ],
        };
      }

      return {
        content: [{ type: "text" as const, text: content }],
      };
    },
  );

  server.tool(
    "learnings_clear_raw",
    "Clear the raw learnings log after they have been processed into the voice profile.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const logPath = getLearningsRawPath(projectDir);
      writeFileSync(logPath, "", "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: "Raw learnings log cleared.",
          },
        ],
      };
    },
  );
}
