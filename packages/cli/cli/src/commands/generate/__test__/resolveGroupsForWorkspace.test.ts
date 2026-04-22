import type { generatorsYml } from "@fern-api/configuration-loader";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { resolveGroupsForWorkspace } from "../resolveGroupsForWorkspace.js";

function makeConfig(
    overrides: Partial<generatorsYml.GeneratorsConfiguration> = {}
): generatorsYml.GeneratorsConfiguration {
    return {
        groups: [],
        defaultGroup: undefined,
        groupAliases: {},
        rawConfiguration: {},
        ...overrides
    } as unknown as generatorsYml.GeneratorsConfiguration;
}

function makeGroup(name: string): generatorsYml.GeneratorGroup {
    return { groupName: name } as unknown as generatorsYml.GeneratorGroup;
}

function makeWorkspace(
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined
): AbstractAPIWorkspace<unknown> {
    return { generatorsConfiguration } as unknown as AbstractAPIWorkspace<unknown>;
}

function silentContext() {
    // Silence the logger so test output stays clean; `resolveGroupsOrFail.test.ts`
    // already covers error-message formatting.
    return createMockTaskContext({ logger: createLogger(() => undefined) });
}

describe("resolveGroupsForWorkspace", () => {
    describe("skip paths (preserve today's warn-and-return behavior in generateWorkspace)", () => {
        it("returns undefined when the workspace has no generators.yml", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(undefined),
                groupNames: ["ts"],
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toBeUndefined();
        });

        it("returns undefined when the workspace defines no groups", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(makeConfig({ groups: [] })),
                groupNames: ["ts"],
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toBeUndefined();
        });

        it("returns undefined for an empty-groups workspace even when no --group was passed", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(makeConfig({ groups: [] })),
                groupNames: undefined,
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toBeUndefined();
        });
    });

    describe("happy path (passes through to resolveGroupsOrFail)", () => {
        it("resolves a single --group that exists in the workspace", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(makeConfig({ groups: [makeGroup("ts"), makeGroup("py")] })),
                groupNames: ["ts"],
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts"]);
        });

        it("resolves multiple --group values to their union (de-duplicated, order-preserving)", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(makeConfig({ groups: [makeGroup("ts"), makeGroup("java"), makeGroup("py")] })),
                groupNames: ["ts", "java", "py"],
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "java", "py"]);
        });

        it("falls back to default-group when no --group is passed", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(
                    makeConfig({ groups: [makeGroup("ts"), makeGroup("py")], defaultGroup: "py" })
                ),
                groupNames: undefined,
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["py"]);
        });

        it("fans out across every group in automation mode when no --group is passed", () => {
            const result = resolveGroupsForWorkspace({
                workspace: makeWorkspace(makeConfig({ groups: [makeGroup("ts"), makeGroup("py"), makeGroup("java")] })),
                groupNames: undefined,
                isAutomation: true,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "py", "java"]);
        });
    });

    describe("failure paths (bubble through to the caller's Promise.all so generation never starts)", () => {
        it("throws when the requested --group does not exist in this workspace", () => {
            // This is the cross-workspace scenario from the review question: workspace A has
            // `typescript` but workspace B doesn't. The pre-flight catches B's misconfiguration
            // and aborts the whole command before A's generation starts.
            expect(() =>
                resolveGroupsForWorkspace({
                    workspace: makeWorkspace(makeConfig({ groups: [makeGroup("java"), makeGroup("py")] })),
                    groupNames: ["typescript"],
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });

        it("throws when no --group was passed and the workspace has no default-group", () => {
            // Other-cross-workspace scenario: workspace A has `default-group: ts`, workspace B
            // has no default. The pre-flight fails on B.
            expect(() =>
                resolveGroupsForWorkspace({
                    workspace: makeWorkspace(makeConfig({ groups: [makeGroup("ts"), makeGroup("py")] })),
                    groupNames: undefined,
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });

        it("throws when the first of several --group values is unknown (fail-fast)", () => {
            expect(() =>
                resolveGroupsForWorkspace({
                    workspace: makeWorkspace(makeConfig({ groups: [makeGroup("ts"), makeGroup("py")] })),
                    groupNames: ["nonexistent", "ts"],
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });
    });
});
