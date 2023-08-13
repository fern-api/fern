import { CONSOLE_LOGGER } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { TaskContextImpl } from "../../TaskContextImpl";

const TASK_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export class TaskContextFactory {
    private idx = 0;

    create(prefix: string): TaskContext {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const colorForWorkspace = TASK_COLORS[this.idx++ % TASK_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        return new TaskContextImpl({
            logImmediately: (logs) => {
                logs.forEach((log) => {
                    CONSOLE_LOGGER.info(...log.parts);
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
