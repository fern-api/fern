import levenshtein from "fast-levenshtein";

/**
 * Returns the numNeighbors nearest lexical neighbors to the target string from the set of neighbors.
 * Lexical distance is measured by Levenshtein distance, with ties broken by lexicographical order.
 * Optionally, a normalize function can be provided to preprocess strings before comparison.
 */
export function getLexicallyNearestNeighbors(
    target: string,
    neighbors: Iterable<string>,
    numNeighbors: number,
    normalize?: (s: string) => string
): Array<string> {
    if (numNeighbors <= 0) {
        return [];
    }
    const norm = normalize ?? ((s: string) => s);
    return Array.from(neighbors)
        .map((neighbor) => {
            return { neighbor, distance: levenshtein.get(norm(target), norm(neighbor)) };
        })
        .sort((a, b) => a.distance - b.distance || a.neighbor.localeCompare(b.neighbor))
        .slice(0, numNeighbors)
        .map((entry) => entry.neighbor);
}
