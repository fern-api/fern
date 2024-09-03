export function getGenericDetails(name: string): { isGeneric: true; name?: string; arguments?: string[] } | undefined {
    const genericMatch = name.match(/([\w.]+)<([\w,\s]+)>/);

    if (
        genericMatch?.[0] != null &&
        genericMatch[1] != null &&
        genericMatch[2] != null &&
        !new Set(["optional", "set", "list", "map", "literal"]).has(genericMatch[1].trim())
    ) {
        return {
            isGeneric: true,
            name: genericMatch[1]?.trim(),
            arguments: genericMatch[2]?.split(",").map((arg) => arg.trim())
        };
    }

    return;
}
