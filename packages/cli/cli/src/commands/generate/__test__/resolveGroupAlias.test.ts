import { describe, expect, it } from "vitest";

import { resolveGroupAlias } from "../resolveGroupAlias.js";

describe("resolveGroupAlias", () => {
    it("resolves a plain group name to a single-element list", () => {
        expect(
            resolveGroupAlias({
                name: "python-sdk",
                groupAliases: {},
                availableGroupNames: ["python-sdk", "ts-sdk"]
            })
        ).toEqual({ type: "resolved", groupNames: ["python-sdk"] });
    });

    it("expands an alias to its target list", () => {
        expect(
            resolveGroupAlias({
                name: "all-sdks",
                groupAliases: { "all-sdks": ["python-sdk", "ts-sdk", "go-sdk"] },
                availableGroupNames: ["python-sdk", "ts-sdk", "go-sdk"]
            })
        ).toEqual({ type: "resolved", groupNames: ["python-sdk", "ts-sdk", "go-sdk"] });
    });

    it("flags alias-references-missing-group when the alias points at a name that doesn't exist", () => {
        expect(
            resolveGroupAlias({
                name: "broken-alias",
                groupAliases: { "broken-alias": ["python-sdk", "nonexistent"] },
                availableGroupNames: ["python-sdk", "ts-sdk"]
            })
        ).toEqual({
            type: "alias-references-missing-group",
            alias: "broken-alias",
            missingGroupName: "nonexistent",
            availableGroupNames: ["python-sdk", "ts-sdk"]
        });
    });

    it("reports the first missing group, not all of them", () => {
        const result = resolveGroupAlias({
            name: "broken",
            groupAliases: { broken: ["a", "b", "c"] },
            availableGroupNames: []
        });
        if (result.type !== "alias-references-missing-group") {
            throw new Error("Expected alias-references-missing-group");
        }
        expect(result.missingGroupName).toBe("a");
    });

    it("returns unknown when the name is neither a group nor an alias", () => {
        const result = resolveGroupAlias({
            name: "typo",
            groupAliases: { "all-sdks": ["python-sdk"] },
            availableGroupNames: ["python-sdk", "ts-sdk"]
        });
        expect(result).toEqual({
            type: "unknown",
            name: "typo",
            availableGroupNames: ["python-sdk", "ts-sdk"],
            availableAliasNames: ["all-sdks"]
        });
    });

    it("prefers alias resolution over direct-group-name matching when both would match", () => {
        // Edge case: if someone defines an alias with the same name as a concrete group,
        // the alias wins (existing behavior — don't silently regress).
        expect(
            resolveGroupAlias({
                name: "shared-name",
                groupAliases: { "shared-name": ["python-sdk", "ts-sdk"] },
                availableGroupNames: ["shared-name", "python-sdk", "ts-sdk"]
            })
        ).toEqual({ type: "resolved", groupNames: ["python-sdk", "ts-sdk"] });
    });

    it("handles an empty alias-target list as a successful resolve", () => {
        // Legacy config could define an alias with an empty list. Not our problem to reject.
        expect(
            resolveGroupAlias({
                name: "empty",
                groupAliases: { empty: [] },
                availableGroupNames: ["python-sdk"]
            })
        ).toEqual({ type: "resolved", groupNames: [] });
    });
});
