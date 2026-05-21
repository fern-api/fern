import { minimatch } from "minimatch";

// Negation (`!pattern`) is NOT honored — every entry is treated as include-only.
// `.fernignore` is a flat list of paths to protect; gitignore-style re-inclusion
// isn't part of the contract.
export function expandFernignorePatterns(fernignoreContent: string, candidatePaths: string[]): string[] {
    const patterns = fernignoreContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
    return candidatePaths.filter((candidate) => patterns.some((pattern) => matches(candidate, pattern)));
}

function matches(candidate: string, pattern: string): boolean {
    const normalized = pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
    if (minimatch(candidate, normalized, { dot: true })) {
        return true;
    }
    return candidate === normalized || candidate.startsWith(normalized + "/");
}
