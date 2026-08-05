import type { docsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import type { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import type { RuleContext } from "../../../Rule.js";
import { NoCollapsedFlattenedApiReferenceRule } from "../no-collapsed-flattened-api-reference.js";

async function runRuleOnApiSection(config: docsYml.RawSchemas.ApiReferenceConfiguration) {
    const visitor = await NoCollapsedFlattenedApiReferenceRule.create({} as RuleContext);
    const apiSectionVisitor = visitor.apiSection;
    if (apiSectionVisitor == null) {
        throw new Error("Expected the rule to define an `apiSection` visitor");
    }
    const node = { config } as DocsConfigFileAstNodeTypes["apiSection"];
    return apiSectionVisitor(node);
}

describe("no-collapsed-flattened-api-reference", () => {
    it("allows collapsed without flattened", async () => {
        const violations = await runRuleOnApiSection({ api: "My API", collapsed: "open-by-default" });
        expect(violations).toEqual([]);
    });

    it("allows flattened without collapsed", async () => {
        const violations = await runRuleOnApiSection({ api: "My API", flattened: true });
        expect(violations).toEqual([]);
    });

    it("allows collapsed with flattened:false (flattened:false is the default no-op)", async () => {
        const violations = await runRuleOnApiSection({ api: "My API", collapsed: true, flattened: false });
        expect(violations).toEqual([]);
    });

    it("rejects collapsed together with flattened:true", async () => {
        const violations = await runRuleOnApiSection({ api: "My API", collapsed: true, flattened: true });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("collapsed");
        expect(violations[0]?.message).toContain("flattened");
    });

    it("rejects every CollapsedValue when combined with flattened:true", async () => {
        for (const collapsed of ["open-by-default", true, false] as const) {
            const violations = await runRuleOnApiSection({ api: "My API", collapsed, flattened: true });
            expect(violations).toHaveLength(1);
        }
    });
});
