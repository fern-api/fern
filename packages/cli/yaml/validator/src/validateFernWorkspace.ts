import { ROOT_API_FILENAME } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernWorkspace, visitAllDefinitionFiles, visitAllPackageMarkers } from "@fern-api/workspace-loader";
import {
    DefinitionFileSchema,
    PackageMarkerFileSchema,
    RootApiFileSchema,
    visitDefinitionFileYamlAst,
    visitPackageMarkerYamlAst,
    visitRootApiFileYamlAst
} from "@fern-api/yaml-schema";
import { createDefinitionFileAstVisitorForRules } from "./createDefinitionFileAstVisitorForRules";
import { createPackageMarkerAstVisitorForRules } from "./createPackageMarkerAstVisitorForRules";
import { createRootApiFileAstVisitorForRules } from "./createRootApiFileAstVisitorForRules";
import { getAllEnabledRules } from "./getAllRules";
import { Rule, RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export async function validateFernWorkspace(workspace: FernWorkspace, logger: Logger): Promise<ValidationViolation[]> {
    return runRulesOnWorkspace({ workspace, rules: getAllEnabledRules(), logger });
}

// exported for testing
export async function runRulesOnWorkspace({
    workspace,
    rules,
    logger
}: {
    workspace: FernWorkspace;
    rules: Rule[];
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = await Promise.all(rules.map((rule) => rule.create({ workspace, logger })));

    const violationsForRoot = await validateRootApiFile({
        contents: workspace.definition.rootApiFile.contents,
        allRuleVisitors
    });
    violations.push(...violationsForRoot);

    await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
        const violationsForFile = await validateDefinitionFile({
            relativeFilepath,
            contents: file,
            allRuleVisitors
        });
        violations.push(...violationsForFile);
    });

    await visitAllPackageMarkers(workspace, async (relativeFilepath, file) => {
        const violationsForFile = await validatePackageMarker({
            relativeFilepath,
            contents: file,
            allRuleVisitors
        });
        violations.push(...violationsForFile);
    });

    return violations;
}

async function validateDefinitionFile({
    relativeFilepath,
    contents,
    allRuleVisitors
}: {
    relativeFilepath: RelativeFilePath;
    contents: DefinitionFileSchema;
    allRuleVisitors: RuleVisitors[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createDefinitionFileAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    await visitDefinitionFileYamlAst(contents, astVisitor);

    return violations;
}

async function validateRootApiFile({
    contents,
    allRuleVisitors
}: {
    contents: RootApiFileSchema;
    allRuleVisitors: RuleVisitors[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createRootApiFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(ROOT_API_FILENAME),
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    await visitRootApiFileYamlAst(contents, astVisitor);

    return violations;
}

async function validatePackageMarker({
    relativeFilepath,
    contents,
    allRuleVisitors
}: {
    relativeFilepath: RelativeFilePath;
    contents: PackageMarkerFileSchema;
    allRuleVisitors: RuleVisitors[];
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createPackageMarkerAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    await visitPackageMarkerYamlAst(contents, astVisitor);

    return violations;
}
