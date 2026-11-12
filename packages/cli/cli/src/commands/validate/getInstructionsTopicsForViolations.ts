import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { InstructionsTopic } from "@fern-api/task-context";

/** Keeps the failure output short when errors span many topics. */
const MAX_TOPICS = 3;

/** Unmapped docs rules fall back to {@link InstructionsTopic.Troubleshoot}. */
export const DOCS_RULE_INSTRUCTIONS_TOPICS: ReadonlyMap<string, InstructionsTopic> = new Map([
    ["valid-markdown", InstructionsTopic.DocsWrite],
    ["valid-frontmatter", InstructionsTopic.DocsWrite],
    ["valid-file-types", InstructionsTopic.DocsWrite],
    ["valid-changelog-slug", InstructionsTopic.DocsWrite],
    ["valid-markdown-links", InstructionsTopic.DocsConfigureNavigation],
    ["filepaths-exist", InstructionsTopic.DocsConfigureNavigation],
    ["navigation-conflicts", InstructionsTopic.DocsConfigureNavigation],
    ["library-folders-in-navigation", InstructionsTopic.DocsConfigureNavigation],
    ["validate-product-file", InstructionsTopic.DocsConfigureNavigation],
    ["validate-version-file", InstructionsTopic.DocsConfigureNavigation],
    ["valid-version-ref", InstructionsTopic.DocsConfigureNavigation],
    ["missing-redirects", InstructionsTopic.DocsConfigureSeo],
    ["no-circular-redirects", InstructionsTopic.DocsConfigureSeo],
    ["valid-redirects-files", InstructionsTopic.DocsConfigureSeo],
    ["robots-txt-on-instance-url-requires-robots-txt", InstructionsTopic.DocsConfigureSeo],
    ["valid-translations-config", InstructionsTopic.DocsConfigureLocalization],
    ["translation-directories-exist", InstructionsTopic.DocsConfigureLocalization],
    ["api-section-has-definition", InstructionsTopic.DocsApiReference],
    ["valid-docs-endpoints", InstructionsTopic.DocsApiReference],
    ["no-openapi-v2-in-docs", InstructionsTopic.DocsApiReference],
    ["valid-openapi-examples", InstructionsTopic.Spec],
    ["no-non-component-refs", InstructionsTopic.Spec],
    ["valid-local-references", InstructionsTopic.Spec],
    ["all-roles-must-be-declared", InstructionsTopic.DocsAccess],
    ["valid-skills-page-action", InstructionsTopic.DocsAi],
    ["valid-well-known-skills", InstructionsTopic.DocsAi],
    ["valid-embedding-origins", InstructionsTopic.DocsAi],
    ["valid-instance-url", InstructionsTopic.DocsPublishDomain],
    ["valid-remote-paths", InstructionsTopic.DocsPublishDomain],
    ["accent-color-contrast", InstructionsTopic.DocsConfigure]
]);

/** Unmapped API rules (Fern Definition and the remaining OpenAPI rules) fall back to {@link InstructionsTopic.Spec}. */
export const API_RULE_INSTRUCTIONS_TOPICS: ReadonlyMap<string, InstructionsTopic> = new Map([
    ["no-duplicate-overrides", InstructionsTopic.SpecOverrides],
    ["compatible-ir-version", InstructionsTopic.Sdks],
    ["valid-alias-group-references", InstructionsTopic.Sdks],
    ["no-direct-rubygems-publishing", InstructionsTopic.SdksPublish],
    ["unsigned-maven-publishing", InstructionsTopic.SdksPublish]
]);

/**
 * Picks the `fern instructions` topics for the violations that fail a run, most errors first.
 * Warnings are ignored unless they fail the run (broken links with `--strict-broken-links`).
 */
export function getInstructionsTopicsForViolations({
    docsViolations = [],
    apiViolations = [],
    errorOnBrokenLinks = false
}: {
    docsViolations?: ValidationViolation[];
    apiViolations?: ValidationViolation[];
    errorOnBrokenLinks?: boolean;
}): InstructionsTopic[] {
    const errorCounts = new Map<InstructionsTopic, number>();
    const count = (topic: InstructionsTopic): void => {
        errorCounts.set(topic, (errorCounts.get(topic) ?? 0) + 1);
    };

    for (const violation of apiViolations) {
        if (isError(violation)) {
            count(lookUpTopic(API_RULE_INSTRUCTIONS_TOPICS, violation) ?? InstructionsTopic.Spec);
        }
    }
    for (const violation of docsViolations) {
        if (isError(violation) || (errorOnBrokenLinks && violation.name === "valid-markdown-links")) {
            count(lookUpTopic(DOCS_RULE_INSTRUCTIONS_TOPICS, violation) ?? InstructionsTopic.Troubleshoot);
        }
    }

    // Array.prototype.sort is stable, so ties keep the order the report prints them in.
    return [...errorCounts.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, MAX_TOPICS)
        .map(([topic]) => topic);
}

function isError(violation: ValidationViolation): boolean {
    return violation.severity === "fatal" || violation.severity === "error";
}

function lookUpTopic(
    topics: ReadonlyMap<string, InstructionsTopic>,
    violation: ValidationViolation
): InstructionsTopic | undefined {
    return violation.name != null ? topics.get(violation.name) : undefined;
}
