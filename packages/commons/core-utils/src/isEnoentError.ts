/**
 * Returns true if the error is a Node.js error with the given system error code (e.g. "ENOENT", "EEXIST").
 */
export function hasErrnoCode(error: unknown, code: string): boolean {
    return typeof error === "object" && error != null && "code" in error && error.code === code;
}

/**
 * Returns true if the error is a Node.js filesystem error with code ENOENT (file or directory not found).
 */
export function isEnoentError(error: unknown): boolean {
    return hasErrnoCode(error, "ENOENT");
}
