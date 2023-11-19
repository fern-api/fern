import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { visitDocsConfigFileYamlAst } from "@fern-api/yaml-schema";
import { createDocsConfigFileAstVisitorForRules } from "./createDocsConfigFileAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { Rule } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export async function validateDocsWorkspace(workspace: DocsWorkspace, logger: Logger): Promise<ValidationViolation[]> {
    return runRulesOnDocsWorkspace({ workspace, rules: getAllRules(), logger });
}

// exported for testing
export async function runRulesOnDocsWorkspace({
    workspace,
    rules,
    logger,
}: {
    workspace: DocsWorkspace;
    rules: Rule[];
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(rules.map((rule) => rule.create({ workspace, logger })));

    const astVisitor = createDocsConfigFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitDocsConfigFileYamlAst(
        workspace.config,
        astVisitor,
        join(workspace.absoluteFilepath, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME))
    );

    return violations;
}
