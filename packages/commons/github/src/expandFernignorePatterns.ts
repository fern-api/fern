import { minimatch } from "minimatch";

const GLOB_CHARS = /[*?[\]{}!]/;

export function expandFernignorePatterns(fernignoreContent: string, candidatePaths: string[]): string[] {
    const patterns = fernignoreContent.split("\n");
    return candidatePaths.filter((candidate) => patterns.some((pattern) => matches(candidate, pattern)));
}

function matches(candidate: string, pattern: string): boolean {
    if (!GLOB_CHARS.test(pattern)) {
        return candidate === pattern || candidate.startsWith(pattern + "/");
    }
    return minimatch(candidate, pattern, { dot: true });
}
