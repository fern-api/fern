export function getDuplicateTargetLanguageIndexes(
    targets: ReadonlyArray<{ language: string }>
): Array<number | undefined> {
    const counts = new Map<string, number>();
    for (const target of targets) {
        counts.set(target.language, (counts.get(target.language) ?? 0) + 1);
    }

    const indexes = new Map<string, number>();
    return targets.map((target) => {
        if (counts.get(target.language) === 1) {
            return undefined;
        }
        const index = indexes.get(target.language) ?? 0;
        indexes.set(target.language, index + 1);
        return index;
    });
}
