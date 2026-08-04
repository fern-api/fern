/**
 * Collapses consecutive slashes in a URL path into a single slash.
 *
 * Endpoints whose API/service base-paths join into an empty segment (e.g. a
 * service `base-path: /`) can produce paths like `/{id}//{nestedId}`. The
 * client must request the same collapsed path the server exposes
 * (`/{id}/{nestedId}`), matching the behavior of the other SDK generators.
 *
 * Slashes following a scheme separator (e.g. `https://`) are preserved.
 */
export function normalizePathSlashes(path: string): string {
    return path.replace(/([^:])\/{2,}/g, "$1/").replace(/^\/{2,}/, "/");
}
