/**
 * Browser-compatible replacement for Node.js `assert.fail`.
 *
 * Throws an error with the given message. This is functionally equivalent
 * to `assert.fail(message)` from the Node.js `assert` module, but works
 * in browser environments without requiring a Node.js polyfill.
 *
 * @param message - The error message
 * @returns never - This function always throws
 */
export function fail(message?: string): never {
    throw new Error(message ?? "Assertion failed");
}
