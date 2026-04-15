import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { createTestContext } from "../../../../__test__/utils/createTestContext.js";
import { CliError } from "@fern-api/task-context";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { resolveApiFilter } from "../resolveApiFilter.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWorkspace(...apiNames: string[]): Workspace {
    const apis: Workspace["apis"] = {};
    for (const name of apiNames) {
        apis[name] = { specs: [] } as unknown as Workspace["apis"][string];
    }
    return { org: "test-org", apis, cliVersion: "0.0.0" };
}

/** Calls resolveApiFilter with isTTY forced to false. */
async function resolveFilter(workspace: Workspace, api?: string): Promise<string | undefined> {
    const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
    Object.defineProperty(context, "isTTY", { get: () => false });
    return resolveApiFilter({ context, args: { api }, workspace });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("resolveApiFilter", () => {
    describe("single API", () => {
        it("returns undefined without prompting", async () => {
            const workspace = makeWorkspace("rest");
            const result = await resolveFilter(workspace);
            expect(result).toBeUndefined();
        });
    });

    describe("--api flag provided", () => {
        it("returns the named API when it exists", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            const result = await resolveFilter(workspace, "grpc");
            expect(result).toBe("grpc");
        });

        it("throws CliError when --api does not match any API", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            await expect(resolveFilter(workspace, "unknown")).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("unknown") &&
                    e.message.includes("rest") &&
                    e.message.includes("grpc")
            );
        });
    });

    describe("multiple APIs — non-TTY", () => {
        it("returns undefined (runs on all) without throwing", async () => {
            const workspace = makeWorkspace("rest", "grpc");
            const result = await resolveFilter(workspace);
            expect(result).toBeUndefined();
        });
    });
});
