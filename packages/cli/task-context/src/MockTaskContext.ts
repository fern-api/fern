import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FernCliError } from "./FernCliError";
import { TaskContext, TaskResult } from "./TaskContext";

export function createMockTaskContext(): TaskContext {
    let result = TaskResult.Success;
    return {
        logger: CONSOLE_LOGGER,
        takeOverTerminal: () => {
            throw new Error("Not implemented");
        },
        failAndThrow: () => {
            result = TaskResult.Failure;
            throw new FernCliError();
        },
        failWithoutThrowing: () => {
            result = TaskResult.Failure;
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
