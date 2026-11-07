import type { Project } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { validateWorkspaces } from "../validateWorkspaces.js";

vi.mock("../checkNodeVersion.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../checkNodeVersion.js")>();
    return { ...actual, checkNodeVersion: () => actual.checkNodeVersion("26.1.0") };
});

describe("validateWorkspaces on an unsupported Node.js version", () => {
    it("reports the Node.js error and fails without validating any workspace", async () => {
        const taskContext = createMockTaskContext();
        const writeJsonToStdout = vi.fn();
        const runTaskForWorkspace = vi.fn();
        const cliContext = {
            failAndThrow: taskContext.failAndThrow.bind(taskContext),
            instrumentPostHogEvent: vi.fn(),
            isJsonMode: true,
            writeJsonToStdout,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace
        } as unknown as CliContext;
        const project = { apiWorkspaces: [], docsWorkspaces: undefined } as unknown as Project;

        await expect(
            validateWorkspaces({
                project,
                cliContext,
                logWarnings: false,
                brokenLinks: false,
                errorOnBrokenLinks: false
            })
        ).rejects.toThrow();

        expect(runTaskForWorkspace).not.toHaveBeenCalled();
        expect(writeJsonToStdout).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                results: { system: [expect.objectContaining({ rule: "supported-node-version" })] }
            })
        );
    });
});
