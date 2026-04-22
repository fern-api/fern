import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import { resolveGroupNamesForGeneration } from "../resolveGroupNamesForGeneration.js";

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

function makeGroup(name: string): { groupName: string } {
    return { groupName: name };
}

describe("resolveGroupNamesForGeneration", () => {
    describe("automation fan-out", () => {
        it("returns every group when in automation and no --group is specified", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py"), makeGroup("go")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: "ts"
                }),
                isAutomation: true
            });
            expect(result).toEqual({ type: "fan-out", groupNames: ["ts", "py", "go"] });
        });

        it("ignores default-group entirely in automation fan-out", () => {
            // default-group is 'ts' but fan-out should ignore that and include every group.
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: "ts"
                }),
                isAutomation: true
            });
            if (result.type !== "fan-out") {
                throw new Error("Expected fan-out result");
            }
            expect(result.groupNames).toContain("py");
        });

        it("returns an empty fan-out list when the project has no groups at all", () => {
            // Caller handles this — we just report what's there.
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({ groups: [] }),
                isAutomation: true
            });
            expect(result).toEqual({ type: "fan-out", groupNames: [] });
        });

        it("falls through to targeted mode when automation is on but --group is specified", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: "py",
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: "ts"
                }),
                isAutomation: true
            });
            expect(result).toEqual({ type: "targeted", groupName: "py", fromDefaultGroup: false });
        });
    });

    describe("non-automation (fern generate)", () => {
        it("uses --group when provided", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: "py",
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: "ts"
                }),
                isAutomation: false
            });
            expect(result).toEqual({ type: "targeted", groupName: "py", fromDefaultGroup: false });
        });

        it("falls back to default-group and flags fromDefaultGroup: true", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: "ts"
                }),
                isAutomation: false
            });
            expect(result).toEqual({ type: "targeted", groupName: "ts", fromDefaultGroup: true });
        });

        it("returns missing-group with available names when nothing is set", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")] as generatorsYml.GeneratorGroup[],
                    defaultGroup: undefined
                }),
                isAutomation: false
            });
            expect(result).toEqual({ type: "missing-group", availableGroupNames: ["ts", "py"] });
        });

        it("does not throw when the project has no groups and no default — caller decides what to do", () => {
            const result = resolveGroupNamesForGeneration({
                groupName: undefined,
                generatorsConfiguration: makeConfig({ groups: [], defaultGroup: undefined }),
                isAutomation: false
            });
            expect(result).toEqual({ type: "missing-group", availableGroupNames: [] });
        });
    });
});
