export function mergeHeaders<THeaderValue>(
    ...headersArray: (Record<string, THeaderValue> | null | undefined)[]
): Record<string, string | THeaderValue> {
    const result: Record<string, THeaderValue> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        const lowercaseKey = key.toLowerCase();
        if (value != null) {
            result[lowercaseKey] = value;
        } else if (lowercaseKey in result) {
            delete result[lowercaseKey];
        }
    }

    return result;
}

export function mergeOnlyDefinedHeaders<THeaderValue>(
    ...headersArray: (Record<string, THeaderValue> | null | undefined)[]
): Record<string, THeaderValue> {
    const result: Record<string, THeaderValue> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        const lowercaseKey = key.toLowerCase();
        if (value != null) {
            result[lowercaseKey] = value;
        }
    }

    return result;
}
