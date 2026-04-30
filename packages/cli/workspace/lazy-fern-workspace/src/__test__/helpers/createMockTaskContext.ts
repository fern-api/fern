import { TaskContext, TaskResult } from "@fern-api/task-context";
import { noop } from "lodash-es";

export function createMockTaskContext(): TaskContext {
    return {
        logger: {
            disable: noop,
            enable: noop,
            trace: noop,
            debug: noop,
            info: noop,
            warn: noop,
            error: noop,
            log: noop
        },
        takeOverTerminal: async () => {
            return;
        },
        failAndThrow: (message?: string) => {
            throw new Error(message ?? "Task failed");
        },
        failWithoutThrowing: noop,
        captureException: noop,
        getResult: () => TaskResult.Success,
        getLastFailureMessage: () => undefined,
        addInteractiveTask: () => {
            throw new Error("Not implemented in mock");
        },
        runInteractiveTask: async () => false,
        instrumentPostHogEvent: noop
    };
}
