import esutils from "esutils";

export function isIdentifierName(name: string): boolean {
    return esutils.keyword.isIdentifierNameES6(name);
}
