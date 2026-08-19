/** Narrows an unknown caught value to a Node.js system error with an error code. */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error;
}

/**
 * Returns true if the given error is a Node.js filesystem error with code ENOENT (file not found).
 */
export function isEnoentError(error: unknown): boolean {
    return isNodeError(error) && error.code === "ENOENT";
}
