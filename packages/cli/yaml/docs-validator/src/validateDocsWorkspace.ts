import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { visitDocsConfigFileYamlAst } from "@fern-api/yaml-schema";
import { createDocsConfigFileAstVisitorForRules } from "./createDocsConfigFileAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { Rule } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export async function validateDocsWorkspace(
    workspace: DocsWorkspace,
    context: TaskContext
): Promise<ValidationViolation[]> {
    return runRulesOnDocsWorkspace({ workspace, rules: getAllRules(), context });
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules,
    context
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    context: TaskContext;
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
        context
    );

    return violations;
}
