/**
 * Logger interface for pipeline steps.
 * Abstracts away the logging implementation so steps work with both
 * the CLI's TaskContext and the standalone CLI subprocess (console).
 */
export interface PipelineLogger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

/**
 * Default logger implementation using stderr (to avoid mixing with JSON result output on stdout).
 */
export const consolePipelineLogger: PipelineLogger = {
    debug: (msg) => process.stderr.write(`[debug] ${msg}\n`),
    info: (msg) => process.stderr.write(`[info] ${msg}\n`),
    warn: (msg) => process.stderr.write(`[warn] ${msg}\n`),
    error: (msg) => process.stderr.write(`[error] ${msg}\n`)
};
