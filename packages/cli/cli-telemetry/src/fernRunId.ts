const FERN_RUN_ID_ENV_VAR = "FERN_RUN_ID";

/**
 * Returns the current FERN_RUN_ID if already set in the environment (e.g. by
 * a GitHub Actions step earlier in the workflow), otherwise generates a new
 * UUIDv4, sets it on process.env so it is available to child processes, and
 * returns it.
 *
 * Call this once at CLI startup before any command executes.
 */
export function getOrCreateFernRunId(): string {
    const existing = process.env[FERN_RUN_ID_ENV_VAR];
    if (existing != null && existing.length > 0) {
        return existing;
    }
    const runId = crypto.randomUUID();
    process.env[FERN_RUN_ID_ENV_VAR] = runId;
    return runId;
}

/**
 * Returns the current FERN_RUN_ID. Assumes getOrCreateFernRunId() has already
 * been called at CLI startup.
 */
export function getFernRunId(): string | undefined {
    return process.env[FERN_RUN_ID_ENV_VAR];
}
