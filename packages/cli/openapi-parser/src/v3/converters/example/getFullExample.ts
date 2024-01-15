export function getFullExampleAsObject(value: unknown): Record<string, any> | undefined {
    if (value != null && typeof value === "object" && Object.keys(value).every((key) => typeof key === "string")) {
        return value;
    }
    return undefined;
}
