import type { generatorsYml } from "@fern-api/configuration-loader";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { resolveGroupsOrFail } from "../resolveGroupsOrFail.js";

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

function silentContext() {
    // We exercise `failAndThrow` and don't care about the rendered message in these tests —
    // `resolveGroupAlias.test.ts` and `resolveGroupNamesForGeneration.test.ts` cover the message
    // logic. Silence the logger so test output stays clean.
    return createMockTaskContext({ logger: createLogger(() => undefined) });
}

describe("resolveGroupsOrFail", () => {
    describe("no --group passed", () => {
        it("falls back to default-group when no --group is supplied", () => {
            const result = resolveGroupsOrFail({
                groupNames: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")],
                    defaultGroup: "ts"
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts"]);
        });

        it("treats an empty array the same as `undefined` (no --group)", () => {
            const result = resolveGroupsOrFail({
                groupNames: [],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")],
                    defaultGroup: "py"
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["py"]);
        });

        it("fans out across every group when in automation and no --group is supplied", () => {
            const result = resolveGroupsOrFail({
                groupNames: undefined,
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py"), makeGroup("go")],
                    defaultGroup: "ts"
                }),
                isAutomation: true,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "py", "go"]);
        });

        it("throws when no --group, no default-group, and not in automation", () => {
            const context = silentContext();
            expect(() =>
                resolveGroupsOrFail({
                    groupNames: undefined,
                    generatorsConfiguration: makeConfig({ groups: [makeGroup("ts")] }),
                    isAutomation: false,
                    context
                })
            ).toThrow(TaskAbortSignal);
        });
    });

    describe("single --group", () => {
        it("returns the single requested concrete group", () => {
            const result = resolveGroupsOrFail({
                groupNames: ["py"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")]
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["py"]);
        });

        it("expands an alias to its target list", () => {
            const result = resolveGroupsOrFail({
                groupNames: ["all-sdks"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py"), makeGroup("go")],
                    groupAliases: { "all-sdks": ["ts", "py", "go"] }
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "py", "go"]);
        });

        it("throws when the single group is unknown", () => {
            expect(() =>
                resolveGroupsOrFail({
                    groupNames: ["typo"],
                    generatorsConfiguration: makeConfig({ groups: [makeGroup("ts"), makeGroup("py")] }),
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });

        it("throws when an alias references a non-existent target", () => {
            expect(() =>
                resolveGroupsOrFail({
                    groupNames: ["broken"],
                    generatorsConfiguration: makeConfig({
                        groups: [makeGroup("ts")],
                        groupAliases: { broken: ["ts", "ghost"] }
                    }),
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });
    });

    describe("multiple --group", () => {
        it("unions multiple concrete groups in the order supplied", () => {
            // This is the original bug report: `fern generate --group typescript --group java --group python`
            // used to fail with "'typescript,java,python' is not a valid group or alias".
            const result = resolveGroupsOrFail({
                groupNames: ["typescript", "java", "python"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("typescript"), makeGroup("java"), makeGroup("python"), makeGroup("go")]
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["typescript", "java", "python"]);
        });

        it("de-duplicates when the same --group is passed twice", () => {
            const result = resolveGroupsOrFail({
                groupNames: ["ts", "ts"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")]
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts"]);
        });

        it("de-duplicates when explicit groups overlap with an alias expansion", () => {
            // `--group ts --group all-sdks` where `all-sdks = [ts, py, go]` should run each group
            // exactly once, with `ts` kept at its first-seen position.
            const result = resolveGroupsOrFail({
                groupNames: ["ts", "all-sdks"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py"), makeGroup("go")],
                    groupAliases: { "all-sdks": ["ts", "py", "go"] }
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "py", "go"]);
        });

        it("de-duplicates when two aliases overlap", () => {
            const result = resolveGroupsOrFail({
                groupNames: ["a", "b"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py"), makeGroup("go")],
                    groupAliases: {
                        a: ["ts", "py"],
                        b: ["py", "go"]
                    }
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["ts", "py", "go"]);
        });

        it("fails fast on the first invalid name and does not attempt subsequent names", () => {
            // If the first name is bad, we throw before inspecting the rest. The error surfaced
            // mentions the first offender so the user fixes it top-down.
            expect(() =>
                resolveGroupsOrFail({
                    groupNames: ["typo", "ts", "py"],
                    generatorsConfiguration: makeConfig({
                        groups: [makeGroup("ts"), makeGroup("py")]
                    }),
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });

        it("fails on a later bad name after earlier names resolve cleanly", () => {
            // Sanity check the loop actually walks past the first entry.
            expect(() =>
                resolveGroupsOrFail({
                    groupNames: ["ts", "typo"],
                    generatorsConfiguration: makeConfig({
                        groups: [makeGroup("ts"), makeGroup("py")]
                    }),
                    isAutomation: false,
                    context: silentContext()
                })
            ).toThrow(TaskAbortSignal);
        });

        it("does not fall back to default-group when any --group is passed", () => {
            // Passing `--group py` should run exactly `py`, not `default-group` + `py`.
            const result = resolveGroupsOrFail({
                groupNames: ["py"],
                generatorsConfiguration: makeConfig({
                    groups: [makeGroup("ts"), makeGroup("py")],
                    defaultGroup: "ts"
                }),
                isAutomation: false,
                context: silentContext()
            });
            expect(result).toEqual(["py"]);
        });
    });
});
