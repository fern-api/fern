import levenshtein from "fast-levenshtein";

/**
 * Returns the numNeighbors nearest lexical neighbors to the target string from the set of neighbors.
 * Lexical distance is measured by Levenshtein distance, with ties broken by lexicographical order.
 */
export function getLexicallyNearestNeighbors(
    target: string,
    neighbors: Iterable<string>,
    numNeighbors: number
): Array<string> {
    if (numNeighbors <= 0) {
        return [];
    }

    return Array.from(neighbors)
        .map((neighbor) => {
            return { neighbor, distance: levenshtein.get(target, neighbor) };
        })
        .sort((a, b) => a.distance - b.distance || a.neighbor.localeCompare(b.neighbor))
        .slice(0, numNeighbors)
        .map((entry) => entry.neighbor);
}
