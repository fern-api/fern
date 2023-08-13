import { assertNever } from "@fern-api/core-utils";
import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { TaskContextImpl } from "../../TaskContextImpl";

const TASK_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export class TaskContextFactory {
    private idx = 0;

    constructor(private readonly logLevel: LogLevel) {}

    create(prefix: string): TaskContext {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const colorForWorkspace = TASK_COLORS[this.idx++ % TASK_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        return new TaskContextImpl({
            logImmediately: (logs) => {
                const filtered = logs.filter(
                    (log) => LOG_LEVELS.indexOf(log.level) >= LOG_LEVELS.indexOf(this.logLevel)
                );
                filtered.forEach((log) => {
                    switch (log.level) {
                        case "debug":
                            CONSOLE_LOGGER.debug(...log.parts);
                            break;
                        case "error":
                            CONSOLE_LOGGER.error(...log.parts);
                            break;
                        case "warn":
                            CONSOLE_LOGGER.warn(...log.parts);
                            break;
                        case "info":
                            CONSOLE_LOGGER.info(...log.parts);
                            break;
                        default:
                            assertNever(log.level);
                    }
                });
            },
            takeOverTerminal: async () => {
                return;
            },
            shouldBufferLogs: false,
            instrumentPostHogEvent: () => {
                return;
            },
            logPrefix: prefixWithColor,
        });
    }
}
