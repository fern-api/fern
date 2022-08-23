import { CONSOLE_LOGGER } from "@fern-api/logger";
import { TaskContext, TaskResult, TASK_FAILURE } from "./TaskContext";

export function createMockTaskContext(): TaskContext {
    let result = TaskResult.Success;
    return {
        logger: CONSOLE_LOGGER,
        takeOverTerminal: () => {
            throw new Error("Not implemented");
        },
        fail: () => {
            result = TaskResult.Failure;
            return TASK_FAILURE;
        },
        getResult: () => result,
        addInteractiveTask: () => {
            throw new Error("Not implemented");
        },
        runInteractiveTask: () => {
            throw new Error("Not implemented");
        },
    };
}
