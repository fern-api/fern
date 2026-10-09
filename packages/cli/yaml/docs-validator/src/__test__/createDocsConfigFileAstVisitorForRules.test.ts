import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { describe, expect, it } from "vitest";

import { createDocsConfigFileAstVisitorForRules } from "../createDocsConfigFileAstVisitorForRules.js";
import { ValidationViolation } from "../ValidationViolation.js";

const NODE_PATH = ["docs.yml"];

function createVisitor({
    throwFromRule,
    severityOverrides
}: {
    throwFromRule: unknown;
    severityOverrides?: Map<string, "warning" | "error">;
}): { visit: () => Promise<void>; violations: ValidationViolation[] } {
    const violations: ValidationViolation[] = [];
    const visitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of("docs.yml"),
        allRulesWithVisitors: [
            {
                ruleName: "throwing-rule",
                visitor: {
                    markdownPage: () => {
                        throw throwFromRule;
                    }
                }
            },
            {
                ruleName: "other-rule",
                visitor: {
                    markdownPage: () => [{ severity: "warning", message: "other rule ran" }]
                }
            }
        ],
        severityOverrides,
        addViolations: (newViolations) => violations.push(...newViolations)
    });
    return {
        visit: async () =>
            await visitor.markdownPage(
                { title: "page", content: "", absoluteFilepath: AbsoluteFilePath.of("/docs/page.mdx") },
                NODE_PATH
            ),
        violations
    };
}

describe("createDocsConfigFileAstVisitorForRules", () => {
    it("reports a rule that throws mid-visit as a fatal violation instead of propagating", async () => {
        const { visit, violations } = createVisitor({ throwFromRule: new Error("boom") });

        await visit();

        expect(violations).toEqual([
            {
                name: "throwing-rule",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of(""),
                nodePath: NODE_PATH,
                message: 'Rule "throwing-rule" failed to run: boom'
            },
            {
                name: "other-rule",
                severity: "warning",
                relativeFilepath: RelativeFilePath.of(""),
                nodePath: NODE_PATH,
                message: "other rule ran"
            }
        ]);
    });

    it("honors the configured severity for a rule that throws mid-visit", async () => {
        const { visit, violations } = createVisitor({
            throwFromRule: new Error("boom"),
            severityOverrides: new Map([["throwing-rule", "warning"]])
        });

        await visit();

        expect(violations[0]?.severity).toBe("warning");
    });
});
