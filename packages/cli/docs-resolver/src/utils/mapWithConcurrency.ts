/**
 * Maps `items` through `fn` with at most `concurrency` calls in flight, returning
 * results in input order regardless of completion order.
 */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    let failed = false;
    // After the first failure, workers stop pulling new items instead of starting more calls.
    const worker = async (): Promise<void> => {
        while (next < items.length && !failed) {
            const index = next++;
            try {
                results[index] = await fn(items[index] as T, index);
            } catch (error) {
                failed = true;
                throw error;
            }
        }
    };
    const workerCount = Math.min(Math.max(1, Math.floor(concurrency)), items.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    return results;
}
