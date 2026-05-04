import { CliError, TaskAbortSignal } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { reportError } from "../telemetry/reportError.js";
import { createMockCliContext } from "./mockCliContext.js";

vi.mock("../telemetry/reportError.js", async (importOriginal) => {
    const original = await importOriginal<typeof import("../telemetry/reportError.js")>();
    return {
        ...original,
        reportError: vi.fn(original.reportError)
    };
});

const reportErrorSpy = vi.mocked(reportError);

describe("error reporting", () => {
    it("task failure via failAndThrow reports exactly once through the full chain", async () => {
        reportErrorSpy.mockClear();
        const cliContext = await createMockCliContext();

        try {
            await cliContext.runTask(async (context) => {
                context.failAndThrow("bad", undefined, { code: CliError.Code.ConfigError });
            });
        } catch (error) {
            expect(error).toBeInstanceOf(TaskAbortSignal);
            cliContext.failWithoutThrowing(undefined, error);
        }

        expect(reportErrorSpy).toHaveBeenCalledOnce();
    });

    it("uncaught task error reports exactly once through the full chain", async () => {
        reportErrorSpy.mockClear();
        const cliContext = await createMockCliContext();

        try {
            await cliContext.runTask(async () => {
                throw new CliError({ message: "something broke", code: CliError.Code.InternalError });
            });
        } catch (error) {
            expect(error).toBeInstanceOf(TaskAbortSignal);
            cliContext.failWithoutThrowing(undefined, error);
        }

        expect(reportErrorSpy).toHaveBeenCalledOnce();
    });
});
