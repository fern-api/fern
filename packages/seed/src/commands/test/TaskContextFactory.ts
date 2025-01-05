import chalk from "chalk";

import { assertNever } from "@fern-api/core-utils";
import { CONSOLE_LOGGER, LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";

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
                    const parts = log.parts.flatMap((parts) => parts).flatMap((part) => part.split("\n"));
                    for (const part of parts) {
                        switch (log.level) {
                            case "debug":
                                CONSOLE_LOGGER.debug(`[${prefixWithColor}]: `, part);
                                break;
                            case "error":
                                CONSOLE_LOGGER.error(`[${prefixWithColor}]: `, part);
                                break;
                            case "warn":
                                CONSOLE_LOGGER.warn(`[${prefixWithColor}]: `, part);
                                break;
                            case "info":
                                CONSOLE_LOGGER.info(`[${prefixWithColor}]: `, part);
                                break;
                            default:
                                assertNever(log.level);
                        }
                    }
                });
            },
            takeOverTerminal: async () => {
                return;
            },
            shouldBufferLogs: false,
            instrumentPostHogEvent: async () => {
                return;
            },
            logPrefix: prefixWithColor
        });
    }
}
