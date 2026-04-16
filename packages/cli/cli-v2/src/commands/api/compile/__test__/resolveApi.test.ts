import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import type { ApiDefinition } from "../../../../api/config/ApiDefinition.js";
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

/** Calls the private `resolveApiEntries` via type cast. */
function resolveApiEntries(
    cmd: CompileCommand,
    workspace: Workspace,
    api?: string
): Array<{ apiName: string; definition: ApiDefinition }> {
    return (
        cmd as unknown as {
            resolveApiEntries: (
                args: { api?: string },
                workspace: Workspace
            ) => Array<{ apiName: string; definition: ApiDefinition }>;
        }
    ).resolveApiEntries({ api }, workspace);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompileCommand.resolveApiEntries", () => {
    const cmd = new CompileCommand();

    describe("single API", () => {
        it("returns the only API", () => {
            const workspace = makeWorkspace("rest");
            const entries = resolveApiEntries(cmd, workspace);
            expect(entries).toHaveLength(1);
            expect(entries[0]?.apiName).toBe("rest");
        });
    });

    describe("--api flag", () => {
        it("returns only the named API when --api matches", () => {
            const workspace = makeWorkspace("rest", "grpc");
            const entries = resolveApiEntries(cmd, workspace, "grpc");
            expect(entries).toHaveLength(1);
            expect(entries[0]?.apiName).toBe("grpc");
        });

        it("throws CliError when --api does not match any API", () => {
            const workspace = makeWorkspace("rest", "grpc");
            let thrown: unknown;
            try {
                resolveApiEntries(cmd, workspace, "unknown");
            } catch (e) {
                thrown = e;
            }
            expect(thrown).toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("unknown") &&
                    e.message.includes("rest") &&
                    e.message.includes("grpc")
            );
        });
    });

    describe("multiple APIs — no --api flag", () => {
        it("returns all APIs when no --api is specified", () => {
            const workspace = makeWorkspace("rest", "grpc");
            const entries = resolveApiEntries(cmd, workspace);
            expect(entries).toHaveLength(2);
            expect(entries.map((e) => e.apiName)).toEqual(expect.arrayContaining(["rest", "grpc"]));
        });
    });
});
