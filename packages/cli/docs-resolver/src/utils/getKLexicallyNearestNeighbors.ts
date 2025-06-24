import levenshtein from "fast-levenshtein";

/**
 * Returns the numNeighbors nearest lexical neighbors to the target string from the set of neighbors.
 * Lexical distance is measured by Levenshtein distance, with ties broken by lexicographical order.
 */
export function getKLexicallyNearestNeighbors(
    target: string,
    neighbors: ReadonlySet<string>,
    numNeighbors: number
): ReadonlyArray<string> {
    // If there are no neighbors or numNeighbors is 0, return empty set
    if (neighbors.size === 0 || numNeighbors <= 0) {
        return new Array();
    }

    // Compute Levenshtein distance for each neighbor
    const scored: Array<{ neighbor: string; distance: number }> = [];
    for (const neighbor of neighbors) {
        const distance = levenshtein.get(target, neighbor);
        scored.push({ neighbor, distance });
    }

    // Sort by distance, then lexicographically
    scored.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        }
        return a.neighbor.localeCompare(b.neighbor);
    });

    // Take the top numNeighbors
    const result = new Array<string>();
    for (let i = 0; i < Math.min(numNeighbors, scored.length); ++i) {
        const neighbor = scored[i]?.neighbor;
        if (neighbor !== undefined) {
            result.push(neighbor);
        }
    }
    return result;
}
