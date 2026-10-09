/**
 * Memoizes both the in-flight archive operation and its result. Concurrent generator tasks must
 * await the same promise; caching only a completion boolean allows siblings to observe an empty
 * result while the first archive is still being built.
 */
export function createSpecsTarGzCache<T>(createArchive: () => Promise<T>): () => Promise<T> {
    let archivePromise: Promise<T> | undefined;
    return () => {
        archivePromise ??= createArchive();
        return archivePromise;
    };
}
