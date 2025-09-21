// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
export function getFullExampleAsObject(value: unknown): Record<string, any> | undefined {
    if (value != null && typeof value === "object" && Object.keys(value).every((key) => typeof key === "string")) {
        return value;
    }
    return undefined;
}

// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
export function getFullExampleAsArray(value: unknown): any[] | undefined {
    if (value != null && Array.isArray(value)) {
        return value;
    }
    return undefined;
}
