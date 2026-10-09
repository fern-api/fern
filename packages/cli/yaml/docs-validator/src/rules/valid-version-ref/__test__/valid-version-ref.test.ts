import type { docsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import type { RuleContext } from "../../../Rule.js";
import { ValidVersionRefRule } from "../valid-version-ref.js";

async function violationsFor(version: docsYml.RawSchemas.VersionConfig): Promise<string[]> {
    const visitor = await ValidVersionRefRule.create({} as RuleContext);
    const versionVisitor = visitor.version;
    if (versionVisitor == null) {
        throw new Error("Expected the rule to define a `version` visitor");
    }
    const violations = await versionVisitor({ version });
    return violations.map((v) => v.message);
}

describe("valid-version-ref", () => {
    it("flags a version that declares both 'ref' and 'path'", async () => {
        const messages = await violationsFor({
            displayName: "2.0",
            ref: "release/2.0",
            path: "./versions/v2.yml"
        });
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain("declares both 'ref' and 'path'");
    });

    it("allows a ref-only version", async () => {
        expect(await violationsFor({ displayName: "2.0", ref: "release/2.0" })).toEqual([]);
    });

    it("allows a path-only (working-tree) version", async () => {
        expect(await violationsFor({ displayName: "Latest", path: "./versions/latest.yml" })).toEqual([]);
    });
});
