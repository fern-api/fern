export function getValueIfBoolean(value: unknown): boolean | undefined {
    if (value != null && typeof value === "boolean") {
        return value;
    }
    return undefined;
}
