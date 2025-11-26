import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { createDocsConfigFileAstVisitorForRules } from "./createDocsConfigFileAstVisitorForRules";
import { visitDocsConfigFileYamlAst } from "./docsAst/visitDocsConfigFileYamlAst";
import { getAllRules } from "./getAllRules";
import { Rule } from "./Rule";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link";
import { ValidationViolation } from "./ValidationViolation";

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
    rules,
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
    context.logger.debug(`Starting docs validation with ${rules.length} rules: ${rules.map((r) => r.name).join(", ")}`);
    context.logger.debug(
        `Initial memory usage: RSS=${(startMemory.rss / 1024 / 1024).toFixed(2)}MB, Heap=${(startMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );

    const violations: ValidationViolation[] = [];

    const ruleCreationStart = performance.now();
    const allRuleVisitors = await Promise.all(
        rules.map((rule) => rule.create({ workspace, apiWorkspaces, ossWorkspaces, logger: context.logger }))
    );
    const ruleCreationTime = performance.now() - ruleCreationStart;
    context.logger.debug(`Created ${rules.length} rule visitors in ${ruleCreationTime.toFixed(0)}ms`);

    const astVisitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        allRuleVisitors,
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
