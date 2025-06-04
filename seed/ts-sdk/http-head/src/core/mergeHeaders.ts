export function mergeHeaders(
    headers1: Record<string, string | undefined> | undefined,
    headers2: Record<string, string | undefined> | undefined,
): Record<string, string> {
    const result: Record<string, string> = {};

    if (headers1) {
        for (const [key, value] of Object.entries(headers1)) {
            if (value !== undefined) {
                result[key] = value;
            } else if (key in result) {
                delete result[key];
            }
        }
    }

    if (headers2) {
        for (const [key, value] of Object.entries(headers2)) {
            if (value !== undefined) {
                result[key] = value;
            } else if (key in result) {
                delete result[key];
            }
        }
    }

    return result;
}
