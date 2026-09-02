/**
 * Builds the emitted expression for testing whether an environment variable is set.
 *
 * When `guarded`, the read goes through `typeof process !== "undefined"`, which never throws
 * even when `process` is an undeclared global (browsers, Cloudflare Workers, Deno).
 */
export function emitEnvVarPresenceCheck({ envConstant, guarded }: { envConstant: string; guarded: boolean }): string {
    return guarded
        ? `(typeof process !== "undefined" && process.env?.[${envConstant}] != null)`
        : `process.env?.[${envConstant}] != null`;
}

/**
 * Builds the emitted expression for reading an environment variable's value, guarded as
 * described in {@link emitEnvVarPresenceCheck}.
 */
export function emitEnvVarValue({ envConstant, guarded }: { envConstant: string; guarded: boolean }): string {
    return guarded
        ? `(typeof process !== "undefined" ? process.env?.[${envConstant}] : undefined)`
        : `process.env?.[${envConstant}]`;
}
