/**
 * Returns the basename of the given path (e.g. "foo/bar/baz" -> "baz").
 */
export function getBasename(path: string): string {
    return path.split("/").pop() ?? "";
}
