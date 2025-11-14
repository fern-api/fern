import { TaskContext } from "@fern-api/task-context";

/**
 * Progress tracker that updates in-place without creating terminal noise.
 * Tracks completed vs remaining endpoints across multiple APIs being processed.
 */
export class ProgressTracker {
    private context: TaskContext;
    private total: number;
    private completed: number;
    private lastLineCount: number = 0;
    private isEnabled: boolean;

    constructor(context: TaskContext, total: number) {
        this.context = context;
        this.total = total;
        this.completed = 0;
        this.isEnabled = process.stdout.isTTY ?? false;
    }

    /**
     * Update progress and render in-place
     */
    public update(completed: number): void {
        this.completed = completed;
        this.render();
    }

    /**
     * Increment completed count by 1
     */
    public increment(): void {
        this.completed++;
        this.render();
    }

    /**
     * Clear the progress display
     */
    public clear(): void {
        if (!this.isEnabled || this.lastLineCount === 0) {
            return;
        }

        for (let i = 0; i < this.lastLineCount; i++) {
            process.stdout.write("\x1b[1A"); // Move up one line
            process.stdout.write("\x1b[2K"); // Clear entire line
        }
        this.lastLineCount = 0;
    }

    /**
     * Render the progress display
     */
    private render(): void {
        if (!this.isEnabled) {
            return;
        }

        this.clear();

        const remaining = this.total - this.completed;
        const percentage = this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;

        const barWidth = 40;
        const filledWidth = Math.round((this.completed / this.total) * barWidth);
        const emptyWidth = barWidth - filledWidth;
        const bar = "█".repeat(filledWidth) + "░".repeat(emptyWidth);

        const lines = [
            `AI Example Generation Progress:`,
            `[${bar}] ${percentage}%`,
            `Completed: ${this.completed}/${this.total} endpoints (${remaining} remaining)`
        ];

        process.stdout.write(lines.join("\n") + "\n");
        this.lastLineCount = lines.length;
    }

    /**
     * Finalize progress display with completion message
     */
    public finish(): void {
        this.clear();
        this.context.logger.info(
            `AI example enhancement completed: ${this.completed}/${this.total} endpoints processed`
        );
    }
}
