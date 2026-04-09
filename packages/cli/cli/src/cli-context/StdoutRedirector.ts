import { CliError } from "@fern-api/task-context";

/**
 * Redirects process.stdout to process.stderr.
 * Can be generalized to FileDescriptorRedirector or StreamRedirector
 * in the future for arbitrary file descriptors or streams
 *
 * Built for --json flag in Cli - integrated into {@link CliContext}:
 * ```ts
 * const cliContext = new CliContext(process.stdout, process.stderr, {});
 *
 * // activates redirect -> everything that writes to stdout goes to stderr
 * cliContext.enableJsonMode();
 *
 * // restores stdout temporarily, writes JSON to stdout, redirects back to stderr
 * cliContext.writeJsonToStdout({ ok: true });
 * ```
 */
export class StdoutRedirector {
    private originalWrite: typeof process.stdout.write | undefined;
    private redirected = false;

    public redirect(): void {
        if (this.redirected) {
            throw new CliError({
                message: "StdoutRedirector: already redirected — did you forget to restore()?",
                code: CliError.Code.InternalError
            });
        }
        this.originalWrite = process.stdout.write;
        process.stdout.write = process.stderr.write.bind(process.stderr) as typeof process.stdout.write;
        this.redirected = true;
    }

    public restore(): void {
        if (!this.redirected || this.originalWrite == null) {
            return;
        }
        process.stdout.write = this.originalWrite;
        this.originalWrite = undefined;
        this.redirected = false;
    }

    /**
     * Run `fn` with stdout redirected to stderr, restoring stdout
     * when `fn` completes (even if it throws).
     */
    public async withRedirect<T>(fn: () => T | Promise<T>): Promise<T> {
        this.redirect();
        try {
            return await fn();
        } finally {
            this.restore();
        }
    }
}
