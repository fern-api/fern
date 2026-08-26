import type { DocsConfigurationWithResolvedRedirects } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import type { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import type { RuleContext } from "../../../Rule.js";
import { NavigationConflicts } from "../navigation-conflicts.js";

async function runRuleOnConfig(partialConfig: Partial<DocsConfigurationWithResolvedRedirects>) {
    const config: DocsConfigurationWithResolvedRedirects = { instances: [], ...partialConfig };
    const visitor = await NavigationConflicts.create({} as RuleContext);
    const fileVisitor = visitor.file;
    if (fileVisitor == null) {
        throw new Error("Expected the rule to define a `file` visitor");
    }
    const node: DocsConfigFileAstNodeTypes["file"] = { config };
    return fileVisitor(node);
}

describe("navigation-conflicts", () => {
    it("allows navigation on its own", async () => {
        const violations = await runRuleOnConfig({
            navigation: [{ page: "Home", path: "./home.mdx" }]
        });
        expect(violations).toEqual([]);
    });

    it("allows products on their own (navigation lives in the referenced product files)", async () => {
        const violations = await runRuleOnConfig({
            products: [{ displayName: "Dynamo", slug: "dynamo", path: "./products/dynamo.yml" }]
        });
        expect(violations).toEqual([]);
    });

    it("allows versions on their own", async () => {
        const violations = await runRuleOnConfig({
            versions: [{ displayName: "v2", path: "./versions/v2.yml" }]
        });
        expect(violations).toEqual([]);
    });

    it("rejects navigation alongside versions", async () => {
        const violations = await runRuleOnConfig({
            navigation: [{ page: "Home", path: "./home.mdx" }],
            versions: [{ displayName: "v2", path: "./versions/v2.yml" }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
        expect(violations[0]?.message).toContain("navigation and versions");
    });

    it("rejects navigation alongside products (reproduces the multi-product empty-nav bug)", async () => {
        const violations = await runRuleOnConfig({
            navigation: [],
            products: [{ displayName: "Dynamo", slug: "dynamo", path: "./products/dynamo.yml" }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
        expect(violations[0]?.message).toContain("navigation and products");
    });

    it("reports both violations when navigation coexists with versions and products", async () => {
        const violations = await runRuleOnConfig({
            navigation: [],
            versions: [{ displayName: "v2", path: "./versions/v2.yml" }],
            products: [{ displayName: "Dynamo", slug: "dynamo", path: "./products/dynamo.yml" }]
        });
        expect(violations).toHaveLength(2);
        expect(violations.every((violation) => violation.severity === "fatal")).toBe(true);
    });
});
