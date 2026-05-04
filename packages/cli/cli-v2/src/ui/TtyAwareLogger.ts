import ansiEscapes from "ansi-escapes";
import IS_CI from "is-ci";

/**
 * A UI component that can be repainted at the bottom of the terminal.
 *
 * Implementations return the full current display as a string on every call.
 * The logger handles clearing and redrawing the previous paint.
 */
export interface Paintable {
    paint(spinnerFrame: string): string;
}

/**
 * Frames for the spinner animation. These are the `dots11` frames from `cli-spinners`,
 * inlined to avoid pulling in `ora`/`cli-spinners` for a single animation.
 */
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const SPINNER_INTERVAL_MS = 100;

/**
 * Renders a set of {@link Paintable}s at the bottom of the terminal while
 * letting callers write normal log output above the paint region.
 *
 * On non-TTY streams (CI, pipes, `--no-tty`) everything degrades to plain
 * line-by-line writes: no spinner, no cursor tricks, no repaints.
 */
export class TtyAwareLogger {
    public readonly isTTY: boolean;

    private readonly stdout: NodeJS.WriteStream;
    private readonly stderr: NodeJS.WriteStream;

    private readonly paintables: Paintable[] = [];
    private lastPaint = "";
    private frameIndex = 0;
    private interval: ReturnType<typeof setInterval> | undefined;

    private suspended = false;
    private suspendBuffer: Array<{ content: string; stderr: boolean }> = [];
    private finished = false;

    constructor(stdout: NodeJS.WriteStream, stderr: NodeJS.WriteStream) {
        this.stdout = stdout;
        this.stderr = stderr;
        this.isTTY = stdout.isTTY === true && !IS_CI;
    }

    /**
     * Register a paintable. The first registration starts the repaint loop.
     */
    public register(paintable: Paintable): void {
        this.paintables.push(paintable);
        if (this.isTTY && this.interval == null) {
            this.stdout.write(ansiEscapes.cursorHide);
            this.repaint();
            this.interval = setInterval(() => this.repaint(), SPINNER_INTERVAL_MS);
        }
    }

    /**
     * Write content above the paint region.
     *
     * On non-TTY streams the content is written verbatim. On TTY streams the
     * paint region is cleared, the content is written, and the paint region
     * is redrawn in place.
     */
    public write(content: string, { stderr = false }: { stderr?: boolean } = {}): void {
        const stream = stderr ? this.stderr : this.stdout;
        if (!this.isTTY) {
            stream.write(content);
            return;
        }
        if (this.suspended) {
            this.suspendBuffer.push({ content, stderr });
            return;
        }
        // Stderr writes interleave with stdout's paint region; clearing on stdout
        // and redrawing after the stderr write keeps the paint anchored.
        this.stdout.write(this.clear());
        stream.write(content);
        this.stdout.write(this.paint());
    }

    /**
     * Pause the paint loop while `run` executes, buffering any `write()` calls,
     * then flush the buffer and resume. Useful for writing content that must
     * not be clobbered by a repaint (e.g. an inquirer prompt).
     */
    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        if (!this.isTTY) {
            await run();
            return;
        }
        this.stopLoop();
        this.stdout.write(this.clear());
        this.suspended = true;
        try {
            await run();
        } finally {
            this.suspended = false;
            for (const { content, stderr: isStderr } of this.suspendBuffer) {
                const stream = isStderr ? this.stderr : this.stdout;
                stream.write(content);
            }
            this.suspendBuffer = [];
            if (this.paintables.length > 0) {
                this.stdout.write(ansiEscapes.cursorHide);
                this.repaint();
                this.interval = setInterval(() => this.repaint(), SPINNER_INTERVAL_MS);
            }
        }
    }

    /**
     * Stop the paint loop, perform one final repaint, and restore the cursor.
     * Idempotent.
     */
    public finish(): void {
        if (!this.isTTY || this.finished) {
            return;
        }
        this.finished = true;
        this.stopLoop();
        this.stdout.write(this.clear() + this.paint());
        this.stdout.write(ansiEscapes.cursorShow);
    }

    private stopLoop(): void {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    private repaint(): void {
        this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
        this.stdout.write(this.clear() + this.paint());
    }

    private clear(): string {
        if (this.lastPaint.length === 0) {
            return "";
        }
        return ansiEscapes.eraseLines(this.lastPaint.split("\n").length);
    }

    private paint(): string {
        if (this.paintables.length === 0) {
            this.lastPaint = "";
            return "";
        }
        const spinnerFrame = SPINNER_FRAMES[this.frameIndex] ?? SPINNER_FRAMES[0];
        const bodies = this.paintables.map((p) => p.paint(spinnerFrame)).filter((body) => body.length > 0);
        if (bodies.length === 0) {
            this.lastPaint = "";
            return "";
        }
        const paint = bodies.join("\n") + "\n";
        this.lastPaint = paint;
        return paint;
    }
}
