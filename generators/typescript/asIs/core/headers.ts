import * as core from "./index.js";

export function mergeHeaders(
    ...headersArray: (Record<string, string | core.Supplier<string | undefined> | undefined> | undefined)[]
): Record<string, string | core.Supplier<string | undefined>> {
    const result: Record<string, string | core.Supplier<string | undefined>> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        if (value != null) {
            result[key] = value;
        } else if (key in result) {
            delete result[key];
        }
    }

    return result;
}

export function mergeOnlyDefinedHeaders(
    ...headersArray: (Record<string, string | core.Supplier<string | undefined> | undefined> | undefined)[]
): Record<string, string | core.Supplier<string | undefined>> {
    const result: Record<string, string | core.Supplier<string | undefined>> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        if (value != null) {
            result[key] = value;
        }
    }

    return result;
}
