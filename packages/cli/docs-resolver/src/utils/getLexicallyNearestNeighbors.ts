import levenshtein from 'fast-levenshtein'
import { Heap } from 'heap-js'

/**
 * Returns the numNeighbors nearest lexical neighbors to the target string from the set of neighbors.
 * Lexical distance is measured by Levenshtein distance, with ties broken by lexicographical order.
 * Optionally, a normalize function can be provided to preprocess strings before comparison.
 */
export function getLexicallyNearestNeighbors(
    target: string,
    neighbors: Iterable<string>,
    numNeighbors: number,
    normalize?: (s: string) => string,
    threshold?: number
): Array<string> {
    if (numNeighbors <= 0) {
        return []
    }
    const norm = normalize ?? ((s: string) => s)
    // Max-heap: worst neighbor at the top
    const maxHeap = new Heap<{ neighbor: string; distance: number }>(maxHeapComparator)
    for (const neighbor of neighbors) {
        const distance = levenshtein.get(norm(target), norm(neighbor))

        if (threshold != null && distance > threshold) {
            continue
        }

        maxHeap.push({ neighbor, distance })
        if (maxHeap.size() > numNeighbors) {
            maxHeap.pop() // Remove the worst
        }
    }

    return heapToSortedArray(maxHeap)
        .reverse()
        .map((item) => item.neighbor)
}

/**
 * Comparator for the max-heap: sorts by distance (descending), then lexicographically (descending).
 * This ensures the "worst" neighbor is at the top of the heap.
 */
function maxHeapComparator(
    a: { neighbor: string; distance: number },
    b: { neighbor: string; distance: number }
): number {
    if (a.distance !== b.distance) {
        return b.distance - a.distance
    }
    return b.neighbor.localeCompare(a.neighbor)
}

function heapToSortedArray<T>(heap: Heap<T>) {
    const result: Array<T> = []
    while (heap.size() > 0) {
        const item = heap.pop()
        if (item) {
            result.push(item)
        }
    }
    return result
}
