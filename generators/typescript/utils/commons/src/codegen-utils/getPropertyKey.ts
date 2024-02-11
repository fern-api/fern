import esutils from "esutils";

export function getPropertyKey(key: string): string {
    if (esutils.keyword.isIdentifierNameES6(key)) {
        return key;
    } else {
        return `"${key}"`;
    }
}
