import { Task } from "../../ui/Task";

/**
 * Creates a mock Task for testing.
 * The no-op functions are intentional for test purposes.
 */
export function createMockTask(): Task {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op for testing
    const noop = (): void => {};
    return {
        start: noop,
        update: noop,
        log: noop,
        error: noop,
        warn: noop,
        info: noop,
        debug: noop,
        complete: noop,
        fail: noop
    } as unknown as Task;
}
