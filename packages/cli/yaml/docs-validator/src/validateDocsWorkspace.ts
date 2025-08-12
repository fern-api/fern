import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
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
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(
        rules.map((rule) => rule.create({ workspace, apiWorkspaces, ossWorkspaces, logger: context.logger }))
    );

    const astVisitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });

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

    return violations;
}
