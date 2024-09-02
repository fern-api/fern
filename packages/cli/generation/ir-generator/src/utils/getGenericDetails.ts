export function getGenericDetails(name: string): { isGeneric: true; name?: string; arguments?: string[] } | undefined {
    const genericMatch = name.match(/(\w+)<([\w,\s]+)>/);

    if (genericMatch?.[0] != null) {
        return {
            isGeneric: true,
            name: genericMatch[1],
            arguments: genericMatch[2]?.split(",").map((arg) => arg.trim())
        };
    }

    return;
}
