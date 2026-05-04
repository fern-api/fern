/**
 * Dedups a list of auth-header entries by header name, preserving the order of
 * first occurrences.
 *
 * Multiple auth schemes can resolve to the same HTTP header name (e.g. an
 * oauth2 bearer scheme + an apiKey-in-header scheme both named
 * `Authorization`). The generated C# `Dictionary<string, string>` collection
 * initializer throws `System.ArgumentException` at runtime when the same key
 * is added twice, so the caller dedups before emitting the initializer.
 *
 * Callers must order inputs so that the preferred entry comes first; the
 * IR-established order of required > optional > literal parameters already
 * places the most specific / required scheme first.
 */
export function dedupAuthHeaderEntries<T>(items: ReadonlyArray<T>, getHeaderName: (item: T) => string): T[] {
    const seen = new Set<string>();
    const result: T[] = [];
    for (const item of items) {
        const name = getHeaderName(item);
        if (seen.has(name)) {
            continue;
        }
        seen.add(name);
        result.push(item);
    }
    return result;
}
