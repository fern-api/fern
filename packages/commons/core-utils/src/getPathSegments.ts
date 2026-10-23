/**
 * Splits a `/`-separated path into its non-empty segments, so leading, trailing and repeated slashes
 * are ignored: `"/a//b/"` becomes `["a", "b"]`.
 */
export function getPathSegments(path: string): string[] {
    return path.split("/").filter((segment) => segment.length > 0);
}
