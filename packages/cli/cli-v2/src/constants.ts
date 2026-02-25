export const FERN_RC_FILENAME = ".fernrc";
export const FERN_TOKEN_ENV_VAR = "FERN_TOKEN";

/**
 * Default timeout for individual HTTP requests (in milliseconds).
 *
 * This replaces the previous global process-level timeout. Instead of killing
 * the entire CLI after a fixed duration (which breaks long-running commands
 * like `fern docs dev` and interactive commands like `fern init`), we apply
 * timeouts at the network request level.
 */
export const HTTP_REQUEST_TIMEOUT_MS = 3_000;

/**
 * Timeout for the `fern sdk generate` command (in milliseconds).
 *
 * Generation involves IR compilation, Docker container execution, and/or
 * remote API calls, so it gets a generous but bounded timeout to prevent
 * runaway processes.
 */
export const GENERATE_COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
