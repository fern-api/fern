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

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext,
    fernWorkspaces: FernWorkspace[]
): Promise<ValidationViolation[]> {
    return runRulesOnDocsWorkspace({ workspace, rules: getAllRules(), context, fernWorkspaces });
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
