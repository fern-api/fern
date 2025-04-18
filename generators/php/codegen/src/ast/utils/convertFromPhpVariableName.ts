/**
 * Converts the the given name from its PHP variable name
 * (i.e. it removes the '$' prefix, if any).
 */
export function convertFromPhpVariableName(name: string): string {
    return name.startsWith("$") ? name.slice(1) : name;
}
