import { existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Resolves the .interfluence directory for a given project.
 * Creates it if it doesn't exist.
 */
export function getInterfluenceDir(projectDir: string): string {
  const dir = join(projectDir, ".interfluence");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getCorpusDir(projectDir: string): string {
  const dir = join(getInterfluenceDir(projectDir), "corpus");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getCorpusIndexPath(projectDir: string): string {
  return join(getInterfluenceDir(projectDir), "corpus-index.yaml");
}

export function getVoiceProfilePath(projectDir: string): string {
  return join(getInterfluenceDir(projectDir), "voice-profile.md");
}

export function getConfigPath(projectDir: string): string {
  return join(getInterfluenceDir(projectDir), "config.yaml");
}

export function getLearningsRawPath(projectDir: string): string {
  return join(getInterfluenceDir(projectDir), "learnings-raw.log");
}

export function getLearningsPath(projectDir: string): string {
  return join(getInterfluenceDir(projectDir), "learnings.md");
}
