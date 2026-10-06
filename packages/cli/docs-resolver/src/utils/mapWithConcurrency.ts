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
    const worker = async (): Promise<void> => {
        while (next < items.length) {
            const index = next++;
            results[index] = await fn(items[index] as T, index);
        }
    };
    const workerCount = Math.min(Math.max(1, Math.floor(concurrency)), items.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    return results;
}
