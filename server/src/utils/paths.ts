import { existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Resolves the .interfluence directory for a given project.
 * Creates it if it doesn't exist.
 */
export function getinterfluenceDir(projectDir: string): string {
  const dir = join(projectDir, ".interfluence");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getCorpusDir(projectDir: string): string {
  const dir = join(getinterfluenceDir(projectDir), "corpus");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getCorpusIndexPath(projectDir: string): string {
  return join(getinterfluenceDir(projectDir), "corpus-index.yaml");
}

const VOICE_NAME_RE = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/;

export function isValidVoiceName(name: string): boolean {
  return VOICE_NAME_RE.test(name);
}

export function getVoicesDir(projectDir: string): string {
  return join(getinterfluenceDir(projectDir), "voices");
}

export function getVoiceProfilePath(projectDir: string, voice?: string): string {
  if (!voice || voice === "base") {
    return join(getinterfluenceDir(projectDir), "voice-profile.md");
  }
  return join(getinterfluenceDir(projectDir), "voices", `${voice}.md`);
}

export function listVoices(projectDir: string): string[] {
  const voicesDir = getVoicesDir(projectDir);
  const voices: string[] = ["base"];
  if (existsSync(voicesDir)) {
    const files = readdirSync(voicesDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
    voices.push(...files);
  }
  return voices;
}

export function getConfigPath(projectDir: string): string {
  return join(getinterfluenceDir(projectDir), "config.yaml");
}

export function getLearningsRawPath(projectDir: string): string {
  return join(getinterfluenceDir(projectDir), "learnings-raw.log");
}

export function getLearningsPath(projectDir: string): string {
  return join(getinterfluenceDir(projectDir), "learnings.md");
}
