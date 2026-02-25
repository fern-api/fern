/**
 * Tracks the current parent command path during synchronous command registration.
 * This allows leaf commands registered via {@link command} to display
 * the full command path (e.g. `fern sdk add`) in their usage text.
 */
let _parentPath: string | undefined;

export function setParentPath(path: string | undefined): void {
    _parentPath = path;
}

export function getParentPath(): string | undefined {
    return _parentPath;
}
