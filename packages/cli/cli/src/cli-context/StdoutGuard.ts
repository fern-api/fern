/**
 * Guards process.stdout during JSON output mode by redirecting
 * all stdout writes to stderr, so only intentional JSON output
 * reaches stdout.
 *
 * Usage:
 *   const guard = new StdoutGuard();
 *   const result = await guard.withRedirect(async () => {
 *       // everything that writes to process.stdout goes to stderr here
 *       return doWork();
 *   });
 *   // stdout is restored — safe to write JSON now
 */
export class StdoutGuard {
    private originalWrite: typeof process.stdout.write | undefined;
    private redirected = false;

    public redirect(): void {
        if (this.redirected) {
            throw new Error("StdoutGuard: already redirected — did you forget to restore()?");
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
