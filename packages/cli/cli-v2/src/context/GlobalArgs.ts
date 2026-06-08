export interface GlobalArgs {
    "log-level": string;
    env?: string;
    /**
     * When true, render full stack traces (and `error.cause` chains) on
     * failure. Mirrors `FERN_DEBUG=1`. Implies `--log-level debug`.
     */
    debug?: boolean;
}
