import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Logger } from "@fern-api/logger";
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
import { findMissingRedirects, MissingRedirectsRule } from "./rules/missing-redirects/index.js";
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
    validChangelogSlug: ValidChangelogSlugRule.name
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

export function getRuleNamesConfiguredAsErrors(checkConfig: docsYml.RawSchemas.CheckConfig | undefined): Set<string> {
    const ruleNames = new Set<string>();
    for (const [ruleName, severity] of buildSeverityOverrides(checkConfig)) {
        if (severity === "error") {
            ruleNames.add(ruleName);
        }
    }
    return ruleNames;
}

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext,
    apiWorkspaces: AbstractAPIWorkspace<unknown>[],
    ossWorkspaces: OSSWorkspace[],
    onlyCheckBrokenLinks?: boolean,
    excludeRules?: string[],
    skipApiReferences?: boolean
): Promise<ValidationViolation[]> {
    // In the future we'll do something more sophisticated that lets you pick and choose which rules to run.
    // For right now, the only use case is to check for broken links, so only expose a choice to run that rule.
    const rules = onlyCheckBrokenLinks ? [ValidMarkdownLinks] : getAllRules(excludeRules);
    return runRulesOnDocsWorkspace({ workspace, rules, context, apiWorkspaces, ossWorkspaces, skipApiReferences });
}

/**
 * Runs the `missing-redirects` rule against docs that the caller already resolved, so a publish
 * doesn't build the docs navigation a second time. Callers should exclude the rule from
 * `validateDocsWorkspace` when they use this. Severity follows `check.rules.missing-redirects`
 * in docs.yml: "error" when configured as error, otherwise "warning".
 */
export async function validateMissingRedirects({
    workspace,
    docsDefinition,
    instanceUrl,
    token,
    logger
}: {
    workspace: DocsWorkspace;
    docsDefinition: DocsV1Write.DocsDefinition;
    /** URL of the docs instance being published; its live pages are the ones compared. */
    instanceUrl: string;
    token: string;
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations = await findMissingRedirects({
        workspace,
        logger,
        instanceUrl,
        token,
        resolveLocalDocs: async () => docsDefinition
    });
    const severity = getRuleNamesConfiguredAsErrors(workspace.config.check).has(MissingRedirectsRule.name)
        ? "error"
        : "warning";
    return violations.map((violation) => ({
        name: MissingRedirectsRule.name,
        severity,
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        nodePath: [],
        message: violation.message
    }));
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules: selectedRules,
    context,
    apiWorkspaces,
    ossWorkspaces,
    skipApiReferences = false
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    context: TaskContext;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    /**
     * Set by `fern docs dev --skip-api`. Keeps `valid-markdown-links` excluded even when docs.yml
     * configures `check.rules.broken-links`, because that rule rebuilds every API reference.
     */
    skipApiReferences?: boolean;
}): Promise<ValidationViolation[]> {
    const startMemory = process.memoryUsage();
    const rules = [...selectedRules];
    const severityOverrides = buildSeverityOverrides(workspace.config.check);
    const validMarkdownLinksOverride = severityOverrides.get(ValidMarkdownLinks.name);
    // Some CLI paths still exclude `valid-markdown-links` unless broken-link checking is enabled.
    // Include it here when docs.yml configures `check.rules.broken-links` so that config takes effect
    // until those CLI args are removed.
    if (validMarkdownLinksOverride != null && rules.find((r) => r.name === ValidMarkdownLinks.name) == null) {
        if (skipApiReferences) {
            context.logger.debug(`Skipping ${ValidMarkdownLinks.name}: API references are skipped (--skip-api)`);
        } else {
            rules.push(ValidMarkdownLinks);
        }
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
