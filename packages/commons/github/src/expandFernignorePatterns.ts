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
    // `nonegate` makes `!` a literal character. Without it, minimatch would
    // invert the result and a stray `!pattern` would silently preserve nearly
    // every file — discarding generator output instead of customer code.
    if (minimatch(candidate, normalized, { dot: true, nonegate: true })) {
        return true;
    }
    return candidate === normalized || candidate.startsWith(normalized + "/");
}
