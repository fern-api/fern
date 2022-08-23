import { addPrefixToString, noop } from "@fern-api/core-utils";
import ansiEscapes from "ansi-escapes";
import IS_CI from "is-ci";
import ora, { Ora } from "ora";
import { Log } from "./Log";
import { TaskContextImpl } from "./TaskContextImpl";

export class TtyAwareLogger {
    private tasks: TaskContextImpl[] = [];
    private lastPaint = "";
    private spinner = ora({ spinner: "dots11" });
    private interval: NodeJS.Timer | undefined;

    public finish: () => void;

    constructor(private readonly stream: NodeJS.WriteStream) {
        if (!this.isTTY) {
            this.finish = noop;
        } else {
            this.write(ansiEscapes.cursorHide);
            this.paintAndStartInterval();
            this.finish = () => {
                clearInterval(this.interval);
                this.repaint();
                this.write(ansiEscapes.cursorShow);
            };
        }
    }

    private paintAndStartInterval() {
        if (this.interval != null) {
            throw new Error("Cannot start interval because interval already exists");
        }
        this.write(this.paint());
        this.interval = setInterval(() => {
            this.repaint();
        }, getSpinnerInterval(this.spinner));
    }

    public registerTask(context: TaskContextImpl): void {
        this.tasks.push(context);
    }

    private shouldBuffer = false;
    private buffer = "";
    private write(content: string) {
        if (this.shouldBuffer) {
            this.buffer += content;
        } else {
            this.stream.write(content);
        }
    }

    private startBuffering() {
        this.shouldBuffer = true;
    }

    private flushAndStopBuffering() {
        const buffer = this.buffer;
        this.buffer = "";
        this.shouldBuffer = false;
        this.write(buffer);
    }

    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        this.startBuffering();
        clearInterval(this.interval);
        await run();
        this.flushAndStopBuffering();
        this.paintAndStartInterval();
    }

    public log(logs: Log[]): void {
        for (const { content, omitOnTTY } of logs) {
            if (!this.isTTY) {
                this.write(content);
            } else if (!omitOnTTY) {
                this.write(this.clear() + content + this.lastPaint);
            }
        }
    }

    private repaint(): void {
        this.write(this.clear() + this.paint());
    }

    private clear(): string {
        return ansiEscapes.eraseLines(this.lastPaint.length > 0 ? countLines(this.lastPaint) : 0);
    }

    private paint(): string {
        const spinnerFrame = this.spinner.frame();

        const taskLines = [];
        for (const task of this.tasks) {
            const paintForTask = task.printInteractiveTasks({ spinner: spinnerFrame });
            if (paintForTask.length > 0) {
                taskLines.push(paintForTask);
            }
        }

        if (taskLines.length === 0) {
            return "";
        }

        const paint =
            [
                "┌─",
                ...taskLines.map((taskLine) =>
                    addPrefixToString({ content: taskLine, prefix: "│ ", includePrefixOnAllLines: true })
                ),
                "└─",
            ].join("\n") + "\n";
        this.lastPaint = paint;
        return paint;
    }

    private get isTTY() {
        return this.stream.isTTY && !IS_CI;
    }
}

function getSpinnerInterval(spinner: Ora) {
    if (typeof spinner.spinner !== "string" && spinner.spinner.interval != null) {
        return spinner.spinner.interval;
    } else {
        return 100;
    }
}

function countLines(str: string): number {
    return [...str].filter((char) => char === "\n").length + 1;
}
