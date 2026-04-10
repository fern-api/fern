export const FERN_RC_FILENAME = ".fernrc";
export const FERN_TOKEN_ENV_VAR = "FERN_TOKEN";

/**
 * Timeout for fetching API spec files over HTTP (in milliseconds).
 */
export const FETCH_API_SPEC_REQUEST_TIMEOUT_MS = 30_000;

/**
 * Timeout for the `fern sdk generate` command (in milliseconds).
 *
 * Generation involves IR compilation, Docker container execution, and/or
 * remote API calls, so it gets a generous but bounded timeout.
 */
export const GENERATE_COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
