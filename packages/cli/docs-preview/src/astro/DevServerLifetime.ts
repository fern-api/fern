/**
 * Machine-readable lifecycle events for `fern docs dev --json`. Agents and CI read these from stdout
 * (one JSON object per line) instead of scraping the human-readable "ready on" log line.
 */
export type DocsDevLifecycleEvent =
    | { event: "ready"; url: string; port: number; backendPort: number; pid: number }
    | { event: "reload"; ok: true; durationMs: number }
    | { event: "reload"; ok: false; durationMs: number; error: string }
    | { event: "stopped"; reason: DocsDevStopReason };

export type DocsDevStopReason = "signal" | "timeout" | "idle-timeout" | "renderer-exit";

export type DevServerExpiryReason = Extract<DocsDevStopReason, "timeout" | "idle-timeout">;

/**
 * Opt-in self-shutdown for `fern docs dev`, so an agent or CI job doesn't have to find and kill the process.
 *
 * - `timeoutMs`: expire this long after `start()` (the server becoming ready), regardless of activity.
 * - `idleTimeoutMs`: expire after this long with no HTTP request in flight. The clock only runs while
 *   nothing is in flight, so a slow page render can't be cut off mid-request.
 *
 * Neither is set by default; the server then runs until it is stopped.
 */
export class DevServerLifetime {
    private readonly timeoutMs: number | undefined;
    private readonly idleTimeoutMs: number | undefined;
    private readonly onExpire: (reason: DevServerExpiryReason) => void;
    private timeoutTimer: NodeJS.Timeout | undefined;
    private idleTimer: NodeJS.Timeout | undefined;
    private inFlightRequests = 0;
    private started = false;
    private disposed = false;

    constructor({
        timeoutMs,
        idleTimeoutMs,
        onExpire
    }: {
        timeoutMs?: number;
        idleTimeoutMs?: number;
        onExpire: (reason: DevServerExpiryReason) => void;
    }) {
        this.timeoutMs = timeoutMs;
        this.idleTimeoutMs = idleTimeoutMs;
        this.onExpire = onExpire;
    }

    public start(): void {
        if (this.started || this.disposed) {
            return;
        }
        this.started = true;
        if (this.timeoutMs != null) {
            this.timeoutTimer = setTimeout(() => this.expire("timeout"), this.timeoutMs);
        }
        this.armIdleTimer();
    }

    public requestStarted(): void {
        this.inFlightRequests++;
        this.clearIdleTimer();
    }

    public requestFinished(): void {
        this.inFlightRequests = Math.max(0, this.inFlightRequests - 1);
        this.armIdleTimer();
    }

    /** Clears every timer. Must run on shutdown: a pending timer would keep the process alive. */
    public dispose(): void {
        this.disposed = true;
        if (this.timeoutTimer != null) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        this.clearIdleTimer();
    }

    private armIdleTimer(): void {
        if (!this.started || this.disposed || this.idleTimeoutMs == null || this.inFlightRequests > 0) {
            return;
        }
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => this.expire("idle-timeout"), this.idleTimeoutMs);
    }

    private clearIdleTimer(): void {
        if (this.idleTimer != null) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }

    private expire(reason: DevServerExpiryReason): void {
        if (this.disposed) {
            return;
        }
        this.dispose();
        this.onExpire(reason);
    }
}
