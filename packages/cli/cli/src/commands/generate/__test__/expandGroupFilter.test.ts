import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import { expandGroupFilter } from "../expandGroupFilter.js";

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

describe("expandGroupFilter", () => {
    it("returns null when no filter is supplied", () => {
        expect(expandGroupFilter(undefined, makeConfig())).toBeNull();
    });

    it("treats an empty array the same as no filter", () => {
        // Yargs' array option can give us `[]` if a plugin normalizes things oddly; either shape
        // should mean "match every group".
        expect(expandGroupFilter([], makeConfig())).toBeNull();
    });

    it("returns the single name as-is when it is a concrete group", () => {
        expect(expandGroupFilter(["python-sdk"], makeConfig())).toEqual(["python-sdk"]);
    });

    it("unions multiple concrete names in the order supplied", () => {
        expect(expandGroupFilter(["typescript", "java", "python"], makeConfig())).toEqual([
            "typescript",
            "java",
            "python"
        ]);
    });

    it("expands an alias to its target list", () => {
        expect(
            expandGroupFilter(
                ["all-sdks"],
                makeConfig({ groupAliases: { "all-sdks": ["python-sdk", "ts-sdk", "go-sdk"] } })
            )
        ).toEqual(["python-sdk", "ts-sdk", "go-sdk"]);
    });

    it("de-duplicates when the same name is passed multiple times", () => {
        // A user might pass `--group ts --group ts` by mistake (or by shell expansion). We should
        // still only generate `ts` once.
        expect(expandGroupFilter(["ts", "ts"], makeConfig())).toEqual(["ts"]);
    });

    it("de-duplicates when aliases and concrete names overlap", () => {
        // `all-sdks` expands to `[ts, py]`; combined with an explicit `ts` we want `[ts, py]`,
        // preserving first-occurrence order.
        expect(
            expandGroupFilter(["ts", "all-sdks"], makeConfig({ groupAliases: { "all-sdks": ["ts", "py"] } }))
        ).toEqual(["ts", "py"]);
    });

    it("de-duplicates when two aliases overlap", () => {
        expect(
            expandGroupFilter(
                ["a", "b"],
                makeConfig({
                    groupAliases: {
                        a: ["ts", "py"],
                        b: ["py", "go"]
                    }
                })
            )
        ).toEqual(["ts", "py", "go"]);
    });

    it("falls back to treating an unknown name as a concrete group (validation lives elsewhere)", () => {
        // This helper is only used for the pre-flight / posthog pass; the authoritative validation
        // is done by `resolveGroupAlias` inside generation. Keeping this permissive lets the
        // downstream error surface the real "unknown group" message with suggestions.
        expect(expandGroupFilter(["typo"], makeConfig({ groupAliases: { "all-sdks": ["ts"] } }))).toEqual(["typo"]);
    });

    it("treats a name as concrete when no generatorsConfiguration is available", () => {
        // Some call sites pass `undefined` for the config when the workspace has none; we should
        // still return the requested names without crashing.
        expect(expandGroupFilter(["ts", "java"], undefined)).toEqual(["ts", "java"]);
    });

    it("contributes nothing when an alias resolves to an empty target list", () => {
        // A malformed alias with `[]` is tolerated as a no-op here — the authoritative resolver
        // will surface the real error when it tries to run.
        expect(expandGroupFilter(["empty", "ts"], makeConfig({ groupAliases: { empty: [] } }))).toEqual(["ts"]);
    });
});
