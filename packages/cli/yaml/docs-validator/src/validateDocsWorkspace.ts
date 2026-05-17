import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import {
    createDocsConfigFileAstVisitorForRules,
    type RuleWithVisitor,
    type SeverityOverride
} from "./createDocsConfigFileAstVisitorForRules.js";
import { visitDocsConfigFileYamlAst } from "./docsAst/visitDocsConfigFileYamlAst.js";
import { formatInitError } from "./formatInitError.js";
import { getAllRules } from "./getAllRules.js";
import { Rule } from "./Rule.js";
import { MissingRedirectsRule } from "./rules/missing-redirects/index.js";
import { NoCircularRedirectsRule } from "./rules/no-circular-redirects/index.js";
import { NoNonComponentRefsRule } from "./rules/no-non-component-refs/index.js";
import { ValidChangelogSlugRule } from "./rules/valid-changelog-slug/index.js";
import { ValidDocsEndpoints } from "./rules/valid-docs-endpoints/index.js";
import { ValidLocalReferencesRule } from "./rules/valid-local-references/index.js";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link/index.js";
import { ValidOpenApiExamples } from "./rules/valid-openapi-examples/index.js";
import { ValidationViolation } from "./ValidationViolation.js";

function toSeverityOverride(severity: docsYml.RawSchemas.CheckRuleSeverity): SeverityOverride {
    switch (severity) {
        case "error":
            return "error";
        case "warn":
            return "warning";
        default:
            assertNever(severity);
    }
}

const CHECK_RULE_CONFIG_TO_RULE_NAME = {
    exampleValidation: ValidOpenApiExamples.name,
    brokenLinks: ValidMarkdownLinks.name,
    noNonComponentRefs: NoNonComponentRefsRule.name,
    validLocalReferences: ValidLocalReferencesRule.name,
    noCircularRedirects: NoCircularRedirectsRule.name,
    validDocsEndpoints: ValidDocsEndpoints.name,
    missingRedirects: MissingRedirectsRule.name,
    validChangelogSlug: ValidChangelogSlugRule.name,
    // md-validate is handled by MdxParseValidator, not the rule visitor.
    // Listed here only to satisfy the Record<keyof CheckRulesConfig, string> constraint.
    mdValidate: "md-validate"
} satisfies Record<keyof docsYml.RawSchemas.CheckRulesConfig, string>;

function buildSeverityOverrides(
    checkConfig: docsYml.RawSchemas.CheckConfig | undefined
): Map<string, SeverityOverride> {
    const severityOverrides = new Map<string, SeverityOverride>();
    const rulesConfig = checkConfig?.rules;
    if (rulesConfig == null) {
        return severityOverrides;
    }
    for (const [configKey, ruleName] of Object.entries(CHECK_RULE_CONFIG_TO_RULE_NAME) as Array<
        [keyof docsYml.RawSchemas.CheckRulesConfig, string]
    >) {
        const severity = rulesConfig[configKey];
        if (severity != null) {
            severityOverrides.set(ruleName, toSeverityOverride(severity));
        }
    }
    return severityOverrides;
}

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext,
    apiWorkspaces: AbstractAPIWorkspace<unknown>[],
    ossWorkspaces: OSSWorkspace[],
    onlyCheckBrokenLinks?: boolean,
    excludeRules?: string[]
): Promise<ValidationViolation[]> {
    // In the future we'll do something more sophisticated that lets you pick and choose which rules to run.
    // For right now, the only use case is to check for broken links, so only expose a choice to run that rule.
    const rules = onlyCheckBrokenLinks ? [ValidMarkdownLinks] : getAllRules(excludeRules);
    return runRulesOnDocsWorkspace({ workspace, rules, context, apiWorkspaces, ossWorkspaces });
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules: selectedRules,
    context,
    apiWorkspaces,
    ossWorkspaces
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    context: TaskContext;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
}): Promise<ValidationViolation[]> {
    const startMemory = process.memoryUsage();
    const rules = [...selectedRules];
    const severityOverrides = buildSeverityOverrides(workspace.config.check);
    const validMarkdownLinksOverride = severityOverrides.get(ValidMarkdownLinks.name);
    // Some CLI paths still exclude `valid-markdown-links` unless broken-link checking is enabled.
    // Include it here when docs.yml configures `check.rules.broken-links` so that config takes effect
    // until those CLI args are removed.
    if (validMarkdownLinksOverride != null && rules.find((r) => r.name === ValidMarkdownLinks.name) == null) {
        rules.push(ValidMarkdownLinks);
    }
    context.logger.debug(`Starting docs validation with ${rules.length} rules: ${rules.map((r) => r.name).join(", ")}`);
    context.logger.debug(
        `Initial memory usage: RSS=${(startMemory.rss / 1024 / 1024).toFixed(2)}MB, Heap=${(startMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );

    const violations: ValidationViolation[] = [];

    const ruleCreationStart = performance.now();
    const ruleCreationResults = await Promise.all(
        rules.map(async (rule): Promise<RuleWithVisitor | { ruleName: string; error: unknown }> => {
            try {
                const visitor = await rule.create({
                    workspace,
                    apiWorkspaces,
                    ossWorkspaces,
                    logger: context.logger
                });
                return { ruleName: rule.name, visitor };
            } catch (error) {
                return { ruleName: rule.name, error };
            }
        })
    );
    const allRulesWithVisitors: RuleWithVisitor[] = [];
    for (const result of ruleCreationResults) {
        if ("error" in result) {
            const message = formatInitError(result.error);
            const severityOverride = severityOverrides.get(result.ruleName);
            // Honor the user's configured severity for init failures. When a
            // rule is configured at `warn` we should surface the failure as a
            // warning rather than a fatal — otherwise the override is
            // silently bypassed whenever the rule throws during setup.
            const severity: ValidationViolation["severity"] =
                severityOverride === "warning" ? "warning" : severityOverride === "error" ? "error" : "fatal";
            violations.push({
                name: result.ruleName,
                severity,
                relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
                nodePath: [],
                message: `Rule "${result.ruleName}" failed to initialize: ${message}`
            });
            context.logger.debug(
                `Rule "${result.ruleName}" failed to initialize: ${
                    result.error instanceof Error ? (result.error.stack ?? result.error.message) : message
                }`
            );
        } else {
            allRulesWithVisitors.push(result);
        }
    }
    const ruleCreationTime = performance.now() - ruleCreationStart;
    context.logger.debug(
        `Created ${allRulesWithVisitors.length} rule visitors in ${ruleCreationTime.toFixed(0)}ms (${
            rules.length - allRulesWithVisitors.length
        } failed to initialize)`
    );

    const astVisitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        allRulesWithVisitors,
        severityOverrides,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });

    const visitStart = performance.now();
    await visitDocsConfigFileYamlAst({
        contents: workspace.config,
        visitor: astVisitor,
        absoluteFilepathToConfiguration: join(
            workspace.absoluteFilePath,
            RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
        ),
        absolutePathToFernFolder: workspace.absoluteFilePath,
        context,
        apiWorkspaces
    });
    const visitTime = performance.now() - visitStart;
    context.logger.debug(`Completed AST traversal in ${visitTime.toFixed(0)}ms`);

    const endMemory = process.memoryUsage();
    context.logger.debug(
        `Final memory usage: RSS=${(endMemory.rss / 1024 / 1024).toFixed(2)}MB, Heap=${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
    context.logger.debug(
        `Memory delta: RSS=${((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2)}MB, Heap=${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`
    );

    return violations;
}
