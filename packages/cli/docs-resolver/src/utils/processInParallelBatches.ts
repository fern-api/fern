/**
 * Processes an array of items in parallel batches.
 *
 * Items within a batch are processed concurrently via `Promise.all`.
 * Batches are processed sequentially — the next batch starts only after the
 * current batch finishes. This bounds the maximum concurrency to `batchSize`.
 *
 * @param items     The items to process.
 * @param batchSize Maximum number of items to process concurrently.
 * @param fn        Async function applied to each item.
 * @returns         Results in the same order as the input items.
 */
export async function processInParallelBatches<T, R>(
    items: readonly T[],
    batchSize: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    const safeBatchSize = Math.max(1, batchSize);
    for (let i = 0; i < items.length; i += safeBatchSize) {
        const batch = items.slice(i, i + safeBatchSize);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
    }
    return results;
}
