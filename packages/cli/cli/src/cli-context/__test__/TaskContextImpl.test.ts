import { Log } from "@fern-api/cli-logger";
import { LogLevel } from "@fern-api/logger";
import { TaskAbortSignal, TaskResult } from "@fern-api/task-context";

import { describe, expect, it } from "vitest";

import { InteractiveTaskContextImpl, TaskContextImpl } from "../TaskContextImpl.js";

function createContext(): { context: TaskContextImpl; getLogs: () => Log[] } {
    const allLogs: Log[] = [];
    const context = new TaskContextImpl({
        logImmediately: (logs) => {
            allLogs.push(...logs);
        },
        takeOverTerminal: async (run) => {
            await run();
        },
        shouldBufferLogs: false,
        instrumentPostHogEvent: () => undefined
    });
    return { context, getLogs: () => allLogs };
}

function createInteractiveContext(): { subtask: InteractiveTaskContextImpl; getLogs: () => Log[] } {
    const allLogs: Log[] = [];
    const subtask = new InteractiveTaskContextImpl({
        name: "test-task",
        subtitle: undefined,
        logImmediately: (logs) => {
            allLogs.push(...logs);
        },
        takeOverTerminal: async (run) => {
            await run();
        },
        shouldBufferLogs: false,
        instrumentPostHogEvent: () => undefined
    });
    return { subtask, getLogs: () => allLogs };
}

describe("TaskContextImpl.getLastFailureMessage", () => {
    it("returns the message passed to failWithoutThrowing", () => {
        const { context } = createContext();
        context.failWithoutThrowing("boom");
        expect(context.getLastFailureMessage()).toBe("boom");
    });

    it("returns the message passed to failAndThrow", () => {
        const { context } = createContext();
        context.start();
        try {
            context.failAndThrow("kaboom");
        } catch (error) {
            expect(error).toBeInstanceOf(TaskAbortSignal);
        }
        expect(context.getLastFailureMessage()).toBe("kaboom");
    });

    it("returns undefined when no message has been recorded", () => {
        const { context } = createContext();
        expect(context.getLastFailureMessage()).toBeUndefined();
    });

    it("does not overwrite the real message when a later failWithoutThrowing is called with only a TaskAbortSignal", () => {
        const { context } = createContext();
        context.failWithoutThrowing("the real error");
        // Simulate the parent-context catch re-invoking failWithoutThrowing with the TaskAbortSignal
        context.failWithoutThrowing(undefined, new TaskAbortSignal());
        expect(context.getLastFailureMessage()).toBe("the real error");
    });
});

describe("InteractiveTaskContextImpl.finish", () => {
    it("is idempotent and does not log Failed. twice", () => {
        const { subtask, getLogs } = createInteractiveContext();
        subtask.start();
        try {
            subtask.failAndThrow("the real error");
        } catch (error) {
            expect(error).toBeInstanceOf(TaskAbortSignal);
        }
        // Simulate runInteractiveTask's `finally { subtask.finish() }`
        subtask.finish();

        const failedLogs = getLogs().filter((log) => log.level === LogLevel.Error && log.parts.join(" ") === "Failed.");
        expect(failedLogs).toHaveLength(1);
        expect(subtask.getResult()).toBe(TaskResult.Failure);
    });

    it("logs Finished. once on success even if finish is called multiple times", () => {
        const { subtask, getLogs } = createInteractiveContext();
        subtask.start();
        subtask.finish();
        subtask.finish();

        const finishedLogs = getLogs().filter(
            (log) => log.level === LogLevel.Info && log.parts.join(" ") === "Finished."
        );
        expect(finishedLogs).toHaveLength(1);
        expect(subtask.getResult()).toBe(TaskResult.Success);
    });
});

describe("runInteractiveTask", () => {
    it("swallows TaskAbortSignal thrown by failAndThrow and surfaces the message via getLastFailureMessage", async () => {
        const { context } = createContext();
        let captured: InteractiveTaskContextImpl | undefined;

        const ok = await context.runInteractiveTask({ name: "child", subtitle: undefined }, (subtask) => {
            captured = subtask as InteractiveTaskContextImpl;
            subtask.failAndThrow("GitHub 422: PR already exists");
        });

        expect(ok).toBe(false);
        expect(captured?.getLastFailureMessage()).toBe("GitHub 422: PR already exists");
    });

    it("does not emit a second log line when it swallows a TaskAbortSignal", async () => {
        const { context, getLogs } = createContext();

        await context.runInteractiveTask({ name: "child", subtitle: undefined }, (subtask) => {
            subtask.failAndThrow("the real error");
        });

        const allText = getLogs()
            .flatMap((log) => log.parts)
            .join("\n");
        // The task already logged "the real error" via failAndThrow; the parent catch must
        // not stringify the TaskAbortSignal (which previously produced "[object Object]").
        expect(allText).not.toContain("[object Object]");
        expect(allText).toContain("the real error");
    });
});
