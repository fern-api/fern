import { TaskContext } from "@fern-api/task-context";

interface ProgressBarState {
    label: string;
    completed: number;
    total: number;
    context: TaskContext;
}

/**
 * Singleton manager that coordinates multiple progress bars for concurrent API processing.
 * Renders all bars in a stacked view atomically to prevent race conditions.
 */
class ProgressManager {
    private static instance: ProgressManager | undefined;
    private bars: Map<string, ProgressBarState> = new Map();
    private renderInterval: NodeJS.Timeout | undefined;
    private lastRenderLineCount: number = 0;
    private cursorHidden: boolean = false;
    private lastSummaryTime: number = 0;
    private readonly isTTY: boolean;
    private readonly stream: NodeJS.WriteStream;

    private constructor() {
        const disableProgress = process.env.FERN_NO_PROGRESS === "1" || process.env.FERN_DISABLE_PROGRESS === "1";
        const summaryOnly = process.env.FERN_PROGRESS_SUMMARY_ONLY === "1";

        this.isTTY = !disableProgress && !summaryOnly && (process.stderr.isTTY ?? false);
        this.stream = process.stderr;

        process.on("exit", () => this.cleanup());
        process.on("SIGINT", () => {
            this.cleanup();
            process.exit(130);
        });
    }

    public static getInstance(): ProgressManager {
        if (!ProgressManager.instance) {
            ProgressManager.instance = new ProgressManager();
        }
        return ProgressManager.instance;
    }

    public createBar(label: string, total: number, context: TaskContext): ProgressBar {
        const id = `${label}-${Date.now()}-${Math.random()}`;
        this.bars.set(id, { label, completed: 0, total, context });

        if (this.bars.size === 1) {
            process.env.FERN_EXTERNAL_SPINNER = "1";
        }

        if (!this.renderInterval) {
            this.startRenderLoop();
        }

        return new ProgressBar(id, this);
    }

    public updateBar(id: string, completed: number): void {
        const bar = this.bars.get(id);
        if (bar) {
            bar.completed = completed;
        }
    }

    public removeBar(id: string): void {
        const bar = this.bars.get(id);
        if (bar) {
            bar.context.logger.info(
                `AI example enhancement completed for ${bar.label}: ${bar.completed}/${bar.total} endpoints processed`
            );
        }

        this.bars.delete(id);

        if (this.bars.size === 0) {
            this.stopRenderLoop();
            delete process.env.FERN_EXTERNAL_SPINNER;
        }
    }

    private startRenderLoop(): void {
        this.lastSummaryTime = Date.now();
        this.renderInterval = setInterval(() => {
            this.render();
        }, 100);
    }

    private stopRenderLoop(): void {
        if (this.renderInterval) {
            clearInterval(this.renderInterval);
            this.renderInterval = undefined;
        }
        this.clearDisplay();
        this.restoreCursor();
    }

    private render(): void {
        if (this.bars.size === 0) {
            return;
        }

        if (this.isTTY) {
            this.renderTTY();
        } else {
            this.renderNonTTY();
        }
    }

    private renderTTY(): void {
        this.clearDisplay();

        if (!this.cursorHidden) {
            this.stream.write("\x1b[?25l");
            this.cursorHidden = true;
        }

        const lines: string[] = [];
        const terminalWidth = this.stream.columns || 80;

        for (const [, bar] of this.bars) {
            const percentage = bar.total > 0 ? Math.round((bar.completed / bar.total) * 100) : 0;
            const remaining = bar.total - bar.completed;

            const labelWidth = 30;
            const truncatedLabel =
                bar.label.length > labelWidth
                    ? bar.label.substring(0, labelWidth - 3) + "..."
                    : bar.label.padEnd(labelWidth);

            const metadataText = ` ${percentage}% (${bar.completed}/${bar.total}, ${remaining} remaining)`;
            const availableBarWidth = Math.max(10, terminalWidth - labelWidth - metadataText.length - 4);

            const filledWidth = Math.round((bar.completed / bar.total) * availableBarWidth);
            const emptyWidth = availableBarWidth - filledWidth;
            const barDisplay = "█".repeat(filledWidth) + "░".repeat(emptyWidth);

            lines.push(`${truncatedLabel} [${barDisplay}]${metadataText}`);
        }

        this.stream.write(lines.join("\n") + "\n");
        this.lastRenderLineCount = lines.length;
    }

    private renderNonTTY(): void {
        const now = Date.now();
        if (now - this.lastSummaryTime < 3000) {
            return;
        }

        this.lastSummaryTime = now;

        const summaries: string[] = [];
        for (const [, bar] of this.bars) {
            summaries.push(`${bar.label}: ${bar.completed}/${bar.total}`);
        }

        if (summaries.length > 0) {
            const firstBar = Array.from(this.bars.values())[0];
            if (firstBar) {
                firstBar.context.logger.info(`AI example generation progress: ${summaries.join(", ")}`);
            }
        }
    }

    private clearDisplay(): void {
        if (!this.isTTY || this.lastRenderLineCount === 0) {
            return;
        }

        for (let i = 0; i < this.lastRenderLineCount; i++) {
            this.stream.write("\x1b[1A");
            this.stream.write("\x1b[2K");
        }
        this.lastRenderLineCount = 0;
    }

    private cleanup(): void {
        this.stopRenderLoop();
        this.restoreCursor();
    }

    private restoreCursor(): void {
        if (this.cursorHidden) {
            this.stream.write("\x1b[?25h");
            this.cursorHidden = false;
        }
    }
}

/**
 * Individual progress bar that registers with the ProgressManager.
 * Updates state without directly writing to the terminal.
 */
export class ProgressBar {
    private id: string;
    private manager: ProgressManager;
    private completed: number = 0;

    constructor(id: string, manager: ProgressManager) {
        this.id = id;
        this.manager = manager;
    }

    public increment(): void {
        this.completed++;
        this.manager.updateBar(this.id, this.completed);
    }

    public update(completed: number): void {
        this.completed = completed;
        this.manager.updateBar(this.id, this.completed);
    }

    public finish(): void {
        this.manager.removeBar(this.id);
    }
}

/**
 * Legacy ProgressTracker for backwards compatibility.
 * Delegates to ProgressManager internally.
 */
export class ProgressTracker {
    private bar: ProgressBar;

    constructor(context: TaskContext, total: number, label: string = "AI Examples") {
        const manager = ProgressManager.getInstance();
        this.bar = manager.createBar(label, total, context);
    }

    public update(completed: number): void {
        this.bar.update(completed);
    }

    public increment(): void {
        this.bar.increment();
    }

    public finish(): void {
        this.bar.finish();
    }
}
