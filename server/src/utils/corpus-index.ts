import { readFileSync, writeFileSync, existsSync } from "fs";
import yaml from "js-yaml";
import { getCorpusIndexPath } from "./paths.js";

export interface CorpusSample {
  id: string;
  filename: string;
  source: string; // "file", "url", "clipboard"
  sourceUrl?: string;
  sourcePath?: string;
  title?: string;
  addedAt: string;
  wordCount: number;
  analyzed: boolean;
  tags?: string[];
}

export interface CorpusIndex {
  samples: CorpusSample[];
}

export function loadCorpusIndex(projectDir: string): CorpusIndex {
  const indexPath = getCorpusIndexPath(projectDir);
  if (!existsSync(indexPath)) {
    return { samples: [] };
  }
  const content = readFileSync(indexPath, "utf-8");
  return (yaml.load(content) as CorpusIndex) || { samples: [] };
}

export function saveCorpusIndex(
  projectDir: string,
  index: CorpusIndex,
): void {
  const indexPath = getCorpusIndexPath(projectDir);
  writeFileSync(indexPath, yaml.dump(index, { lineWidth: 120 }), "utf-8");
}

export function generateSampleId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `sample-${ts}-${rand}`;
}
