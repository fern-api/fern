import { minimatch } from "minimatch";

export function expandFernignorePatterns(fernignoreContent: string, candidatePaths: string[]): string[] {
    const patterns = fernignoreContent.split("\n");
    return candidatePaths.filter((candidate) =>
        patterns.some((pattern) => minimatch(candidate, pattern, { dot: true }))
    );
}
