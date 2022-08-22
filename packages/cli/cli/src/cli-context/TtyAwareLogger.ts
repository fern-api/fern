import { noop } from "@fern-api/core-utils";
import ansiEscapes from "ansi-escapes";
import ora, { Ora } from "ora";
import { addPrefixToLog } from "./addPrefixToLog";
import { TaskContextImpl } from "./TaskContextImpl";

export class TtyAwareLogger {
    private tasks: TaskContextImpl[] = [];
    private lastPaint = "";
    private spinner = ora({ spinner: "dots11" });

    public finish: () => void;

    constructor(private readonly stream: NodeJS.WriteStream) {
        if (!stream.isTTY) {
            this.finish = noop;
        } else {
            stream.write(this.paint());

            const interval = setInterval(() => {
                this.repaint();
            }, getSpinnerInterval(this.spinner));

            this.finish = () => {
                clearInterval(interval);
                this.repaint();
            };
        }
    }

    public registerTask(context: TaskContextImpl): void {
        this.tasks.push(context);
    }

    public log(content: string): void {
        if (this.stream.isTTY) {
            this.stream.write(this.clear() + content + this.lastPaint);
        } else {
            this.stream.write(content);
        }
    }

    private repaint(): void {
        this.stream.write(this.clear() + this.paint());
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
                    addPrefixToLog({ content: taskLine, prefix: "│ ", includePrefixOnAllLines: true })
                ),
                "└─",
            ].join("\n") + "\n";
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

function countLines(str: string): number {
    return [...str].filter((char) => char === "\n").length + 1;
}
