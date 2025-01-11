import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { Rule } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";
import { createDocsConfigFileAstVisitorForRules } from "./createDocsConfigFileAstVisitorForRules";
import { APIWorkspaceLoader } from "./docsAst/APIWorkspaceLoader";
import { visitDocsConfigFileYamlAst } from "./docsAst/visitDocsConfigFileYamlAst";
import { getAllRules } from "./getAllRules";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link";

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext,
    fernWorkspaces: FernWorkspace[],
    onlyCheckBrokenLinks?: boolean
): Promise<ValidationViolation[]> {
    // In the future we'll do something more sophisticated that lets you pick and choose which rules to run.
    // For right now, the only use case is to check for broken links, so only expose a choise to run that rule.
    const rules = onlyCheckBrokenLinks ? [ValidMarkdownLinks] : getAllRules();
    return runRulesOnDocsWorkspace({ workspace, rules, context, fernWorkspaces });
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules,
    context,
    fernWorkspaces
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    context: TaskContext;
    fernWorkspaces: FernWorkspace[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(
        rules.map((rule) => rule.create({ workspace, fernWorkspaces, logger: context.logger }))
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
        fernWorkspaces
    });

    return violations;
}
