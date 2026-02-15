import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import {
  getVoiceProfilePath,
  getConfigPath,
  getLearningsRawPath,
  getLearningsPath,
} from "../utils/paths.js";
import yaml from "js-yaml";

export interface interfluenceConfig {
  mode: "auto" | "manual";
  autoApplyTo: string[];
  exclude: string[];
  learnFromEdits: boolean;
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
    "Get the current voice profile. Returns the full voice-profile.md content.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
    },
    async ({ projectDir }) => {
      const profilePath = getVoiceProfilePath(projectDir);

      if (!existsSync(profilePath)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No voice profile exists yet. Use /interfluence analyze to generate one from your corpus.",
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
    "Save or update the voice profile. Writes the full voice-profile.md content.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      content: z.string().describe("The full voice profile markdown content"),
    },
    async ({ projectDir, content }) => {
      const profilePath = getVoiceProfilePath(projectDir);
      writeFileSync(profilePath, content, "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: `Voice profile saved to ${profilePath}`,
          },
        ],
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
    "Save the interfluence configuration.",
    {
      projectDir: z.string().describe("Absolute path to the project directory"),
      mode: z.enum(["auto", "manual"]).optional(),
      autoApplyTo: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      learnFromEdits: z.boolean().optional(),
    },
    async ({ projectDir, mode, autoApplyTo, exclude, learnFromEdits }) => {
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
