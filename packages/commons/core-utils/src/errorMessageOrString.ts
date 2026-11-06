/**
 * Returns `error.message` for an `Error`, and `String(error)` for anything else.
 *
 * This is the exact behavior of the common inline `e instanceof Error ? e.message : String(e)`.
 * Unlike `extractErrorMessage`, it does not substitute "Unknown error" for empty messages and it does
 * not read `message` from plain objects, so it is safe to use where the old output must not change.
 */
export function errorMessageOrString(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
