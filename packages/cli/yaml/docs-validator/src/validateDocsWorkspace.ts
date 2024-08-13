import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { createDocsConfigFileAstVisitorForRules } from "./createDocsConfigFileAstVisitorForRules";
import { APIWorkspaceLoader } from "./docsAst/APIWorkspaceLoader";
import { visitDocsConfigFileYamlAst } from "./docsAst/visitDocsConfigFileAst";
import { getAllRules } from "./getAllRules";
import { Rule } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext,
    loadApiWorkspace: APIWorkspaceLoader
): Promise<ValidationViolation[]> {
    return runRulesOnDocsWorkspace({ workspace, rules: getAllRules(), context, loadApiWorkspace });
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules,
    context,
    loadApiWorkspace
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    context: TaskContext;
    loadApiWorkspace: APIWorkspaceLoader;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(rules.map((rule) => rule.create({ workspace, logger: context.logger })));

    const astVisitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });

    await visitDocsConfigFileYamlAst(
        workspace.config,
        astVisitor,
        join(workspace.absoluteFilepath, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
        workspace.absoluteFilepath,
        context,
        loadApiWorkspace
    );

    return violations;
}
