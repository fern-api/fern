import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { createTestContext } from "../../../../__test__/utils/createTestContext.js";
import type { Target } from "../../../../sdk/config/Target.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { GenerateCommand } from "../command.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTarget(name: string, groups?: string[]): Target {
    return {
        name,
        api: "api",
        image: `fernapi/fern-${name}-sdk`,
        registry: undefined,
        lang: "typescript",
        version: "1.0.0",
        sourceLocation: { file: "fern.yml", range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } } },
        output: { path: `./generated/${name}` },
        groups
    } as unknown as Target;
}

function makeWorkspace(targets: Target[]): Workspace {
    return {
        org: "test-org",
        apis: {},
        cliVersion: "0.0.0",
        sdks: { org: "test-org", targets }
    };
}

/** Calls the private `getTargets` method via type cast. */
async function getTargets(
    cmd: GenerateCommand,
    {
        workspace,
        args,
        groupName
    }: {
        workspace: Workspace;
        args: Partial<GenerateCommand.Args>;
        groupName?: string;
    }
): Promise<Target[]> {
    const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
    // Force isTTY = false so promptSelect always throws CliError instead of showing TUI
    Object.defineProperty(context, "isTTY", { get: () => false });

    return (
        cmd as unknown as {
            getTargets: (opts: {
                context: typeof context;
                workspace: Workspace;
                args: Partial<GenerateCommand.Args>;
                groupName: string | undefined;
            }) => Promise<Target[]>;
        }
    ).getTargets({ context, workspace, args: args as GenerateCommand.Args, groupName: groupName ?? undefined });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GenerateCommand.getTargets", () => {
    const cmd = new GenerateCommand();

    describe("single target", () => {
        it("returns the target when only one is configured", async () => {
            const workspace = makeWorkspace([makeTarget("typescript")]);
            const targets = await getTargets(cmd, { workspace, args: {} });
            expect(targets).toHaveLength(1);
            expect(targets[0]?.name).toBe("typescript");
        });
    });

    describe("--target flag", () => {
        it("returns only the named target when --target matches", async () => {
            const workspace = makeWorkspace([makeTarget("typescript"), makeTarget("python")]);
            const targets = await getTargets(cmd, { workspace, args: { target: "python" } });
            expect(targets).toHaveLength(1);
            expect(targets[0]?.name).toBe("python");
        });

        it("throws CliError when --target does not match any configured target", async () => {
            const workspace = makeWorkspace([makeTarget("typescript"), makeTarget("python")]);
            await expect(getTargets(cmd, { workspace, args: { target: "ruby" } })).rejects.toSatisfy(
                (e) => e instanceof CliError && e.message.includes("ruby") && e.message.includes("typescript")
            );
        });
    });

    describe("--group flag", () => {
        it("returns only targets in the specified group", async () => {
            const workspace = makeWorkspace([
                makeTarget("typescript", ["production"]),
                makeTarget("python", ["staging"])
            ]);
            const targets = await getTargets(cmd, { workspace, args: {}, groupName: "production" });
            expect(targets).toHaveLength(1);
            expect(targets[0]?.name).toBe("typescript");
        });

        it("throws when --group matches no targets", async () => {
            const workspace = makeWorkspace([makeTarget("typescript", ["production"])]);
            await expect(getTargets(cmd, { workspace, args: {}, groupName: "staging" })).rejects.toSatisfy(
                (e) => e instanceof CliError && e.message.includes("No targets found for group 'staging'")
            );
        });
    });

    describe("multiple targets — no groups defined (non-TTY)", () => {
        it("throws CliError listing available targets and --target hint", async () => {
            const workspace = makeWorkspace([makeTarget("typescript"), makeTarget("python"), makeTarget("go")]);
            await expect(getTargets(cmd, { workspace, args: {} })).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("typescript") &&
                    e.message.includes("python") &&
                    e.message.includes("go") &&
                    e.message.includes("--target")
            );
        });
    });

    describe("multiple targets — groups defined (non-TTY)", () => {
        it("throws CliError listing available groups and --group hint", async () => {
            const workspace = makeWorkspace([
                makeTarget("typescript", ["production"]),
                makeTarget("python", ["staging"])
            ]);
            await expect(getTargets(cmd, { workspace, args: {} })).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("production") &&
                    e.message.includes("staging") &&
                    e.message.includes("--group")
            );
        });
    });

    describe("no targets configured", () => {
        it("throws when sdks is undefined", async () => {
            const workspace: Workspace = { org: "test-org", apis: {}, cliVersion: "0.0.0" };
            await expect(getTargets(cmd, { workspace, args: {} })).rejects.toSatisfy(
                (e) => e instanceof CliError && e.message.includes("No targets configured")
            );
        });

        it("throws when targets array is empty", async () => {
            const workspace = makeWorkspace([]);
            await expect(getTargets(cmd, { workspace, args: {} })).rejects.toSatisfy(
                (e) => e instanceof CliError && e.message.includes("No targets configured")
            );
        });
    });

    describe("target-version override", () => {
        it("overrides the version when --target-version is specified", async () => {
            const workspace = makeWorkspace([makeTarget("typescript")]);
            const targets = await getTargets(cmd, { workspace, args: { "target-version": "2.0.0" } });
            expect(targets[0]?.version).toBe("2.0.0");
        });

        it("uses the configured version when --target-version is not specified", async () => {
            const workspace = makeWorkspace([makeTarget("typescript")]);
            const targets = await getTargets(cmd, { workspace, args: {} });
            expect(targets[0]?.version).toBe("1.0.0");
        });
    });
});
