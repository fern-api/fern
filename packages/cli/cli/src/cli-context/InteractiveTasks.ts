import ansiEscapes from "ansi-escapes";
import ora, { Ora } from "ora";
import { InteractiveTaskContextImpl } from "./InteractiveTaskContextImpl";

export class InteractiveTasks {
    private tasks: InteractiveTaskContextImpl[] = [];
    private lastPaint = "";
    private spinner = ora();
    private interval: NodeJS.Timeout;

    constructor(private readonly stream: NodeJS.WriteStream) {
        this.interval = setInterval(() => {
            this.repaint();
        }, getSpinnerInterval(this.spinner));
    }

    public finish(): void {
        clearInterval(this.interval);
    }

    public addTask(task: InteractiveTaskContextImpl): void {
        this.tasks.push(task);
    }

    public prependAndRepaint(content: string): void {
        this.stream.write(this.clear() + content + "\n" + this.lastPaint);
    }

    private repaint(): void {
        this.stream.write(this.clear() + this.paint());
    }

    private clear(): string {
        return ansiEscapes.eraseLines(this.lastPaint.length > 0 ? this.lastPaint.split("\n").length : 0);
    }

    private paint(): string {
        const spinnerFrame = this.spinner.frame();
        let paint = "";
        for (const task of this.tasks) {
            paint += task.print({ spinner: spinnerFrame }) + "\n";
        }
        this.lastPaint = paint;
        return paint;
    }
}

function getSpinnerInterval(spinner: Ora) {
    if (typeof spinner.spinner !== "string" && spinner.spinner.interval != null) {
        return spinner.spinner.interval;
    } else {
        return 100;
    }
}
