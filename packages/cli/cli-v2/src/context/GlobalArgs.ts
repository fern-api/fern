export interface GlobalArgs {
    "log-level": string;
    env?: string;
    /**
     * When true, render full stack traces (and `error.cause` chains) on
     * failure. Mirrors `FERN_DEBUG=1`. Implies `--log-level debug`.
     */
    debug?: boolean;
    /**
     * When true, render errors as a JSON envelope on stderr so CI pipelines
     * and agents can parse failure details without scraping human output.
     *
     * Commands that produce structured success output (e.g. `auth whoami`,
     * `sdk list`) also declare this locally for their stdout path; the
     * global flag guarantees the *error* path is JSON-serializable
     * regardless of which command ran.
     */
    json?: boolean;
}
