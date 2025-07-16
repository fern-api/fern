export function getDisplayName(field: { "display-name"?: string } | string): string | undefined {
    if (typeof field === "string") {
        return undefined;
    }

    return field["display-name"];
}
