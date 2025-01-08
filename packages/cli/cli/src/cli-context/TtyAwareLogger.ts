import ansiEscapes from "ansi-escapes";
import chalk from "chalk";
import IS_CI from "is-ci";
import ora, { Ora } from "ora";

import { addPrefixToString, assertNever, noop } from "@fern-api/core-utils";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";

import { Log } from "./Log";
import { TaskContextImpl } from "./TaskContextImpl";

export class TtyAwareLogger {
    private tasks: TaskContextImpl[] = [];
    private lastPaint = "";
    private spinner = ora({ spinner: "dots11" });
    private interval: NodeJS.Timer | undefined;

    constructor(private readonly stream: NodeJS.WriteStream) {
        this.start();
    }

    private start() {
        if (this.isTTY) {
            this.write(ansiEscapes.cursorHide);
            this.paintAndStartInterval();
            this.finish = () => {
                clearInterval(this.interval);
                this.interval = undefined;
                this.repaint();
                this.write(ansiEscapes.cursorShow);
                this.finish = noop;
            };
        }
    }

    // overwritten by start()
    public finish: () => void = noop;

    private paintAndStartInterval() {
        if (this.interval != null) {
            throw new Error("Cannot start interval because interval already exists");
        }
        this.write(this.paint());
        this.interval = setInterval(this.repaint.bind(this), getSpinnerInterval(this.spinner));
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
        this.shouldBuffer = false;
        this.write(this.buffer);
        this.buffer = "";
    }

    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        this.startBuffering();
        this.finish();
        await run();
        this.start();
        this.flushAndStopBuffering();
    }

    public log(logs: Log[], { includeDebugInfo = false }: { includeDebugInfo?: boolean } = {}): void {
        for (const log of logs) {
            const content = formatLog(log, { includeDebugInfo });
            const omitOnTTY = log.omitOnTTY ?? false;
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
                "└─"
            ].join("\n") + "\n";
        this.lastPaint = paint;
        return paint;
    }

    public get isTTY(): boolean {
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
    let numLines = 1;
    for (const char of str) {
        if (char === "\n") {
            numLines++;
        }
    }
    return numLines;
}

function formatLog(log: Log, { includeDebugInfo }: { includeDebugInfo: boolean }): string {
    let content = log.parts.join(" ");
    if (log.prefix != null) {
        content = addPrefixToString({
            prefix: log.prefix,
            content
        });
    }
    if (includeDebugInfo) {
        content = addPrefixToString({
            prefix: chalk.dim(getDebugPrefix(log)),
            content
        });
    }
    content += "\n";

    switch (log.level) {
        case LogLevel.Error:
            return chalk.red(content);
        case LogLevel.Warn:
            return chalk.hex("FFA500")(content);
        case LogLevel.Debug:
        case LogLevel.Info:
            return content;
    }
}

const LONGEST_LOG_LEVEL_STRING_LENGTH = Math.max(...LOG_LEVELS.map((level) => getLogLevelAsString(level).length));
function getDebugPrefix(log: Log) {
    return `${getLogLevelAsString(log.level).padEnd(LONGEST_LOG_LEVEL_STRING_LENGTH)} ${log.time.toISOString()} `;
}

function getLogLevelAsString(logLevel: LogLevel) {
    switch (logLevel) {
        case LogLevel.Debug:
            return "DEBUG";
        case LogLevel.Info:
            return "INFO";
        case LogLevel.Warn:
            return "WARN";
        case LogLevel.Error:
            return "ERROR";
        default:
            assertNever(logLevel);
    }
}
