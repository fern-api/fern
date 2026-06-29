import { describe, expect, it } from "vitest";
import type { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import type { RuleViolation } from "../../../Rule.js";
import { NoConflictingFeedbackConfigRule } from "../no-conflicting-feedback-config.js";

function buildConfig(
    overrides: Partial<DocsConfigFileAstNodeTypes["file"]["config"]> = {}
): DocsConfigFileAstNodeTypes["file"]["config"] {
    return {
        instances: [],
        ...overrides
    } as DocsConfigFileAstNodeTypes["file"]["config"];
}

async function runRule(config: DocsConfigFileAstNodeTypes["file"]["config"]): Promise<RuleViolation[]> {
    const visitor = await NoConflictingFeedbackConfigRule.create({} as never);
    const fileVisitor = visitor.file;
    if (fileVisitor == null) {
        throw new Error("file visitor is undefined");
    }
    return fileVisitor({ config });
}

describe("NoConflictingFeedbackConfigRule", () => {
    it("should return no violations when neither feedback nor layout.hideFeedback is set", async () => {
        const violations = await runRule(buildConfig());
        expect(violations).toEqual([]);
    });

    it("should return no violations when only feedback is set without layout.hideFeedback", async () => {
        const violations = await runRule(
            buildConfig({
                feedback: { hideFeedback: true, requireEmail: false },
                layout: {}
            })
        );
        expect(violations).toEqual([]);
    });

    it("should return no violations when only layout.hideFeedback is set without feedback", async () => {
        const violations = await runRule(
            buildConfig({
                layout: { hideFeedback: true }
            })
        );
        expect(violations).toEqual([]);
    });

    it("should return an error when both feedback and layout.hideFeedback are set", async () => {
        const violations = await runRule(
            buildConfig({
                feedback: { hideFeedback: true },
                layout: { hideFeedback: true }
            })
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("Cannot use 'layout.hide-feedback' alongside the 'feedback' object");
        expect(violations[0]?.message).toContain("move 'hide-feedback' into the 'feedback' object");
    });

    it("should return an error when feedback exists and layout.hideFeedback is false", async () => {
        const violations = await runRule(
            buildConfig({
                feedback: { requireEmail: true },
                layout: { hideFeedback: false }
            })
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
    });

    it("should return no violations when layout exists but hideFeedback is undefined", async () => {
        const violations = await runRule(
            buildConfig({
                feedback: { requireEmail: true },
                layout: { searchbarPlacement: "header" }
            })
        );
        expect(violations).toEqual([]);
    });
});
