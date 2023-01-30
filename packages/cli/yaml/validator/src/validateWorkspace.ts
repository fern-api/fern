import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { visitAllServiceFiles, Workspace } from "@fern-api/workspace-loader";
import {
    RootApiFileSchema,
    ServiceFileSchema,
    visitFernRootApiFileYamlAst,
    visitFernServiceFileYamlAst,
} from "@fern-api/yaml-schema";
import { createRootApiFileAstVisitorForRules } from "./createRootApiFileAstVisitorForRules";
import { createServiceFileAstVisitorForRules } from "./createServiceFileAstVisitorForRules";
import { getAllEnabledRules } from "./getAllRules";
import { Rule, RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export async function validateWorkspace(workspace: Workspace, logger: Logger): Promise<ValidationViolation[]> {
    return runRulesOnWorkspace({ workspace, rules: getAllEnabledRules(), logger });
}

// exported for testing
export async function runRulesOnWorkspace({
    workspace,
    rules,
    logger,
}: {
    workspace: Workspace;
    rules: Rule[];
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(rules.map((rule) => rule.create({ workspace, logger })));

    const violationsForRoot = await validateRootApiFile({
        contents: workspace.definition.rootApiFile.contents,
        allRuleVisitors,
    });
    violations.push(...violationsForRoot);

    await visitAllServiceFiles(workspace, async (relativeFilepath, file) => {
        const violationsForFile = await validateServiceFile({
            relativeFilepath,
            contents: file,
            allRuleVisitors,
        });
        violations.push(...violationsForFile);
    });

    return violations;
}

async function validateServiceFile({
    relativeFilepath,
    contents,
    allRuleVisitors,
}: {
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema;
    allRuleVisitors: RuleVisitors[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createServiceFileAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernServiceFileYamlAst(contents, astVisitor);

    return violations;
}

async function validateRootApiFile({
    contents,
    allRuleVisitors,
}: {
    contents: RootApiFileSchema;
    allRuleVisitors: RuleVisitors[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createRootApiFileAstVisitorForRules({
        relativeFilepath: ROOT_API_FILENAME,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernRootApiFileYamlAst(contents, astVisitor);

    return violations;
}
