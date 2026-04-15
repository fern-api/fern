import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { createTestContext } from "../../../../__test__/utils/createTestContext.js";
import type { ApiDefinition } from "../../../../api/config/ApiDefinition.js";
import type { Context } from "../../../../context/Context.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { CompileCommand } from "../command.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWorkspace(...apiNames: string[]): Workspace {
    const apis: Record<string, ApiDefinition> = {};
    for (const name of apiNames) {
        apis[name] = { specs: [] } as unknown as ApiDefinition;
    }
    return { org: "test-org", apis, cliVersion: "0.0.0" };
}

/** Calls the private `resolveApi` via type cast with isTTY forced to false. */
async function resolveApi(
    cmd: CompileCommand,
    workspace: Workspace,
    api?: string
): Promise<{ apiName: string; definition: ApiDefinition }> {
    const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
    Object.defineProperty(context, "isTTY", { get: () => false });

    return (
        cmd as unknown as {
            resolveApi: (
                context: Context,
                args: { api?: string },
                workspace: Workspace
            ) => Promise<{ apiName: string; definition: ApiDefinition }>;
        }
    ).resolveApi(context, { api }, workspace);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompileCommand.resolveApi", () => {
    const cmd = new CompileCommand();

    describe("single API", () => {
        it("returns the only API without prompting", async () => {
            const workspace = makeWorkspace("rest");
            const result = await resolveApi(cmd, workspace);
            expect(result.apiName).toBe("rest");
        });
    });

    describe("--api flag", () => {
        it("returns the named API when --api matches", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            const result = await resolveApi(cmd, workspace, "grpc");
            expect(result.apiName).toBe("grpc");
        });

        it("throws CliError when --api does not match any API", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            await expect(resolveApi(cmd, workspace, "unknown")).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("unknown") &&
                    e.message.includes("rest") &&
                    e.message.includes("grpc")
            );
        });
    });

    describe("multiple APIs — non-TTY", () => {
        it("throws CliError listing all APIs and --api hint", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            await expect(resolveApi(cmd, workspace)).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("rest") &&
                    e.message.includes("grpc") &&
                    e.message.includes("--api")
            );
        });
    });
});
