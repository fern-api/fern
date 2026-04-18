import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";
import { listGenerateCommands } from "../listGenerateCommands.js";

type WorkspaceInput = Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">;

/** Creates a minimal GeneratorInvocation stub for testing. */
function makeGenerator(
    overrides: Partial<Pick<generatorsYml.GeneratorInvocation, "automation" | "absolutePathToLocalOutput" | "raw">> = {}
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-node-sdk",
        automation: { generate: true, upgrade: true, preview: true, verify: true },
        absolutePathToLocalOutput: undefined,
        raw: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

/** Creates a minimal GeneratorGroup stub. */
function makeGroup(groupName: string, generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        groupName,
        audiences: { type: "all" },
        generators,
        reviewers: undefined
    };
}

/** Creates a workspace stub for testing. */
function makeWorkspace(
    workspaceName: string | undefined,
    groups: generatorsYml.GeneratorGroup[],
    autorelease?: boolean
): WorkspaceInput {
    return {
        workspaceName,
        generatorsConfiguration: {
            groups,
            rawConfiguration: { autorelease }
        }
    } as unknown as WorkspaceInput;
}

describe("listGenerateCommands", () => {
    describe("basic command generation", () => {
        it("generates a command for a single generator", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 0"]);
        });

        it("generates commands for multiple generators in a group", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator(), makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([
                "fern automations generate --group sdk --generator 0",
                "fern automations generate --group sdk --generator 1"
            ]);
        });
    });

    describe("skip logic", () => {
        it("skips generators with automation.generate = false", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [
                    makeGenerator({
                        automation: { generate: false, upgrade: true, preview: true, verify: true }
                    })
                ])
            ]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });

        it("skips generators with local output", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [
                    makeGenerator({
                        absolutePathToLocalOutput:
                            "/tmp/output" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
                    })
                ])
            ]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });

        it("skips generators with autorelease = false", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [
                    makeGenerator({
                        raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"]
                    })
                ])
            ]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });
    });

    describe("options", () => {
        it("includes --version when provided", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: "AUTO",
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 0 --version AUTO"]);
        });

        it("includes --auto-merge when enabled", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: true
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 0 --auto-merge"]);
        });

        it("includes both --version and --auto-merge", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: "1.0.0",
                autoMerge: true
            });

            expect(result).toEqual([
                "fern automations generate --group sdk --generator 0 --version 1.0.0 --auto-merge"
            ]);
        });
    });

    describe("multi-API workspaces", () => {
        it("includes --api for named workspaces", () => {
            const workspace = makeWorkspace("payments", [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --api payments --group sdk --generator 0"]);
        });

        it("omits --api for unnamed workspaces", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 0"]);
        });

        it("returns commands from multiple workspaces", () => {
            const workspaceA = makeWorkspace("payments", [makeGroup("sdk", [makeGenerator()])]);
            const workspaceB = makeWorkspace("users", [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspaceA, workspaceB],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([
                "fern automations generate --api payments --group sdk --generator 0",
                "fern automations generate --api users --group sdk --generator 0"
            ]);
        });
    });

    describe("group filter", () => {
        it("filters to the specified group name", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [makeGenerator()]),
                makeGroup("docs", [makeGenerator()])
            ]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: "sdk",
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 0"]);
        });

        it("returns empty array when filter matches no groups", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("sdk", [makeGenerator()])]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: "nonexistent",
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });
    });

    describe("edge cases", () => {
        it("returns empty array for empty workspaces list", () => {
            const result = listGenerateCommands({
                workspaces: [],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });

        it("skips workspaces with no generators configuration", () => {
            const workspace = {
                workspaceName: undefined,
                generatorsConfiguration: undefined
            } as unknown as WorkspaceInput;

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual([]);
        });

        it("uses correct generator index when some are skipped", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [
                    makeGenerator({
                        automation: { generate: false, upgrade: true, preview: true, verify: true }
                    }),
                    makeGenerator()
                ])
            ]);

            const result = listGenerateCommands({
                workspaces: [workspace],
                groupFilter: undefined,
                version: undefined,
                autoMerge: false
            });

            expect(result).toEqual(["fern automations generate --group sdk --generator 1"]);
        });
    });
});
