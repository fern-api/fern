/**
 * Run async tasks with a concurrency limit.
 * Similar to p-limit but implemented locally to avoid adding dependencies.
 *
 * @param limit - Maximum number of concurrent tasks
 * @param items - Array of items to process
 * @param fn - Async function to run for each item
 * @returns Promise that resolves when all tasks are complete
 */
export async function asyncPool<T, R>(
    limit: number,
    items: T[],
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    const executing: Set<Promise<void>> = new Set();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item === undefined) {
            continue;
        }

        const promise = (async () => {
            const result = await fn(item, i);
            results[i] = result;
        })().then(() => {
            executing.delete(promise);
        });

        executing.add(promise);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
    return results;
}
