export function getDuplicateTargetLanguages(targets: ReadonlyArray<{ language: string }>): Set<string> {
    const counts = new Map<string, number>();
    for (const target of targets) {
        counts.set(target.language, (counts.get(target.language) ?? 0) + 1);
    }
    return new Set([...counts].filter(([, count]) => count > 1).map(([language]) => language));
}
