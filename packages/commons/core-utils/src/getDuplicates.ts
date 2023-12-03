export function getDuplicates<T>(items: readonly T[]): T[] {
    const seen = new Set<T>();

    // store duplicates in a set for easy lookup,
    // but as a list so that order is maintained when we return
    const duplicatesSet = new Set<T>();
    const duplicates: T[] = [];

    for (const item of items) {
        if (seen.has(item) && !duplicatesSet.has(item)) {
            duplicatesSet.add(item);
            duplicates.push(item);
        }
        seen.add(item);
    }
    return duplicates;
}
