import { getAllRules as getAllDocsRules } from "@fern-api/docs-validator";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { getAllRules as getAllGeneratorsRules } from "@fern-api/generators-validator";
import { getAllRules as getAllOpenApiRules } from "@fern-api/oss-validator";
import { InstructionsTopic } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import {
    API_RULE_INSTRUCTIONS_TOPICS,
    DOCS_RULE_INSTRUCTIONS_TOPICS,
    getInstructionsTopicsForViolations
} from "../getInstructionsTopicsForViolations.js";

function violation(name: string | undefined, severity: ValidationViolation["severity"] = "error"): ValidationViolation {
    return { name, severity, relativeFilepath: RelativeFilePath.of("docs.yml"), nodePath: [], message: "message" };
}

describe("getInstructionsTopicsForViolations", () => {
    it("returns the topic for a mapped docs rule", () => {
        expect(getInstructionsTopicsForViolations({ docsViolations: [violation("missing-redirects")] })).toEqual([
            InstructionsTopic.DocsConfigureSeo
        ]);
    });

    it("returns one topic when several rules share it", () => {
        expect(
            getInstructionsTopicsForViolations({
                docsViolations: [
                    violation("valid-markdown"),
                    violation("valid-frontmatter"),
                    violation("valid-markdown")
                ]
            })
        ).toEqual([InstructionsTopic.DocsWrite]);
    });

    it("orders mixed topics by error count, then report order, and caps them at three", () => {
        expect(
            getInstructionsTopicsForViolations({
                apiViolations: [violation("no-duplicate-overrides")],
                docsViolations: [
                    violation("valid-instance-url"),
                    violation("missing-redirects"),
                    violation("valid-markdown"),
                    violation("valid-frontmatter")
                ]
            })
        ).toEqual([InstructionsTopic.DocsWrite, InstructionsTopic.SpecOverrides, InstructionsTopic.DocsPublishDomain]);
    });

    it("ignores warnings", () => {
        expect(
            getInstructionsTopicsForViolations({
                docsViolations: [violation("missing-redirects", "warning"), violation("valid-markdown", "fatal")]
            })
        ).toEqual([InstructionsTopic.DocsWrite]);
        expect(
            getInstructionsTopicsForViolations({ docsViolations: [violation("valid-markdown", "warning")] })
        ).toEqual([]);
    });

    it("counts broken-link warnings only when they fail the run", () => {
        const docsViolations = [violation("valid-markdown-links", "warning")];
        expect(getInstructionsTopicsForViolations({ docsViolations })).toEqual([]);
        expect(getInstructionsTopicsForViolations({ docsViolations, errorOnBrokenLinks: true })).toEqual([
            InstructionsTopic.DocsConfigureNavigation
        ]);
    });

    it("falls back to troubleshoot for unmapped docs rules and spec for unmapped API rules", () => {
        expect(
            getInstructionsTopicsForViolations({
                docsViolations: [violation("some-future-rule"), violation(undefined)]
            })
        ).toEqual([InstructionsTopic.Troubleshoot]);
        expect(
            getInstructionsTopicsForViolations({
                apiViolations: [violation("no-undefined-type-reference"), violation(undefined)]
            })
        ).toEqual([InstructionsTopic.Spec]);
    });

    it("maps every docs rule, and only real ones", () => {
        const docsRuleNames = getAllDocsRules()
            .map((rule) => rule.name)
            .sort();
        expect([...DOCS_RULE_INSTRUCTIONS_TOPICS.keys()].sort()).toEqual(docsRuleNames);
    });

    it("maps only real generators.yml and OpenAPI rules", () => {
        const apiRuleNames = new Set([...getAllGeneratorsRules(), ...getAllOpenApiRules()].map((rule) => rule.name));
        expect([...API_RULE_INSTRUCTIONS_TOPICS.keys()].filter((name) => !apiRuleNames.has(name))).toEqual([]);
    });
});
