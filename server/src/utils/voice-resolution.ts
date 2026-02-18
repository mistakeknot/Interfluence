import { minimatch } from "minimatch";

export interface VoiceConfig {
  name: string;
  applyTo: string[];
}

/**
 * Resolves which voice matches a file path.
 * Iterates voices in array order — first match wins.
 * Returns the matching voice name, or null if no match (use base).
 */
export function resolveVoice(
  filePath: string,
  voices: VoiceConfig[],
): string | null {
  for (const voice of voices) {
    for (const pattern of voice.applyTo) {
      if (minimatch(filePath, pattern, { matchBase: false })) {
        return voice.name;
      }
    }
  }
  return null;
}
