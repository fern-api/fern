export function isGeneric(name: string): boolean {
    const genericMatch = name.match(/([\w.]+)<([\w,\s]+)>/);

    return (
        genericMatch?.[0] != null &&
        genericMatch[1] != null &&
        !new Set(["optional", "set", "list", "map", "literal"]).has(genericMatch[1].trim())
    );
}
