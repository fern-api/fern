import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";
import { listPreviewGroups } from "../listPreviewGroups.js";

type WorkspaceInput = Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">;

/** Creates a minimal GeneratorInvocation stub for testing. */
function makeGenerator(
    name: string,
    overrides: Partial<Pick<generatorsYml.GeneratorInvocation, "automation">> = {}
): generatorsYml.GeneratorInvocation {
    return {
        name,
        automation: { generate: true, upgrade: true, preview: true, verify: true },
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
function makeWorkspace(workspaceName: string | undefined, groups: generatorsYml.GeneratorGroup[]): WorkspaceInput {
    return {
        workspaceName,
        generatorsConfiguration: { groups }
    } as unknown as WorkspaceInput;
}

describe("listPreviewGroups", () => {
    describe("basic detection", () => {
        it("detects a single TypeScript node-sdk generator", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([
                { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-node-sdk" }
            ]);
        });

        it("detects a single TypeScript browser-sdk generator", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("browser", [makeGenerator("fernapi/fern-typescript-browser-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([
                { groupName: "browser", apiName: null, generator: "fernapi/fern-typescript-browser-sdk" }
            ]);
        });

        it("detects a single TypeScript sdk generator", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("sdk", [makeGenerator("fernapi/fern-typescript-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([{ groupName: "sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" }]);
        });
    });

    describe("non-TypeScript generators", () => {
        it("excludes Python SDK generators", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("python", [makeGenerator("fernapi/fern-python-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("excludes Java SDK generators", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("java", [makeGenerator("fernapi/fern-java-sdk")])]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("excludes Go SDK generators", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("go", [makeGenerator("fernapi/fern-go-sdk")])]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });
    });

    describe("automation.preview flag", () => {
        it("excludes generators with automation.preview = false", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [
                    makeGenerator("fernapi/fern-typescript-node-sdk", {
                        automation: { generate: true, upgrade: true, preview: false, verify: true }
                    })
                ])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("includes generators with automation.preview = true", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [
                    makeGenerator("fernapi/fern-typescript-node-sdk", {
                        automation: { generate: true, upgrade: true, preview: true, verify: true }
                    })
                ])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toHaveLength(1);
            expect(result[0]?.groupName).toBe("ts-sdk");
        });
    });

    describe("mixed generator groups", () => {
        it("includes only the first TypeScript generator from a group with mixed languages", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("all-sdks", [
                    makeGenerator("fernapi/fern-typescript-node-sdk"),
                    makeGenerator("fernapi/fern-python-sdk"),
                    makeGenerator("fernapi/fern-java-sdk")
                ])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([
                { groupName: "all-sdks", apiName: null, generator: "fernapi/fern-typescript-node-sdk" }
            ]);
        });

        it("deduplicates multiple TypeScript generators in the same group to one entry", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts", [
                    makeGenerator("fernapi/fern-typescript-node-sdk"),
                    makeGenerator("fernapi/fern-typescript-browser-sdk")
                ])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toHaveLength(1);
            expect(result).toEqual([{ groupName: "ts", apiName: null, generator: "fernapi/fern-typescript-node-sdk" }]);
        });

        it("picks the first previewable generator when non-previewable ones come first", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts", [
                    makeGenerator("fernapi/fern-typescript-node-sdk", {
                        automation: { generate: true, upgrade: true, preview: false, verify: true }
                    }),
                    makeGenerator("fernapi/fern-typescript-browser-sdk")
                ])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([
                { groupName: "ts", apiName: null, generator: "fernapi/fern-typescript-browser-sdk" }
            ]);
        });
    });

    describe("multi-API workspaces", () => {
        it("includes apiName from the workspace", () => {
            const workspace = makeWorkspace("payments", [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([
                { groupName: "ts-sdk", apiName: "payments", generator: "fernapi/fern-typescript-node-sdk" }
            ]);
        });

        it("returns results from multiple workspaces", () => {
            const workspaceA = makeWorkspace("payments", [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")])
            ]);
            const workspaceB = makeWorkspace("users", [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-sdk")])
            ]);

            const result = listPreviewGroups({
                workspaces: [workspaceA, workspaceB],
                groupFilter: undefined
            });

            expect(result).toEqual([
                { groupName: "ts-sdk", apiName: "payments", generator: "fernapi/fern-typescript-node-sdk" },
                { groupName: "ts-sdk", apiName: "users", generator: "fernapi/fern-typescript-sdk" }
            ]);
        });

        it("uses null for apiName when workspace has no name", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result[0]?.apiName).toBeNull();
        });
    });

    describe("group filter", () => {
        it("filters to the specified group name", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")]),
                makeGroup("browser-sdk", [makeGenerator("fernapi/fern-typescript-browser-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: "ts-sdk" });

            expect(result).toEqual([
                { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-node-sdk" }
            ]);
        });

        it("returns empty array when filter matches no groups", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: "nonexistent" });

            expect(result).toEqual([]);
        });

        it("returns all groups when filter is undefined", () => {
            const workspace = makeWorkspace(undefined, [
                makeGroup("ts-sdk", [makeGenerator("fernapi/fern-typescript-node-sdk")]),
                makeGroup("browser-sdk", [makeGenerator("fernapi/fern-typescript-browser-sdk")])
            ]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toHaveLength(2);
        });
    });

    describe("edge cases", () => {
        it("returns empty array for empty workspaces list", () => {
            const result = listPreviewGroups({ workspaces: [], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("skips workspaces with no generators configuration", () => {
            const workspace = {
                workspaceName: undefined,
                generatorsConfiguration: undefined
            } as unknown as WorkspaceInput;

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("skips workspaces with empty groups", () => {
            const workspace = makeWorkspace(undefined, []);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });

        it("skips groups with no generators", () => {
            const workspace = makeWorkspace(undefined, [makeGroup("empty", [])]);

            const result = listPreviewGroups({ workspaces: [workspace], groupFilter: undefined });

            expect(result).toEqual([]);
        });
    });
});
