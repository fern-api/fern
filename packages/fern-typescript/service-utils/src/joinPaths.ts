import path from "path";

export function joinPaths(...paths: readonly (string | undefined)[]): string {
    return path.join(...paths.filter(isNonNullish));
}

function isNonNullish<T>(x: T | null | undefined): x is T {
    return x != null;
}
