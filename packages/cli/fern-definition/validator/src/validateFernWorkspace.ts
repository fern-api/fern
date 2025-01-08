import { FernWorkspace, visitAllDefinitionFiles, visitAllPackageMarkers } from "@fern-api/api-workspace-commons";
import { GENERATORS_CONFIGURATION_FILENAME, ROOT_API_FILENAME, generatorsYml } from "@fern-api/configuration-loader";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";

import { Rule, RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";
import { visitDefinitionFileYamlAst, visitPackageMarkerYamlAst, visitRootApiFileYamlAst } from "./ast";
import { createDefinitionFileAstVisitorForRules } from "./createDefinitionFileAstVisitorForRules";
import { createPackageMarkerAstVisitorForRules } from "./createPackageMarkerAstVisitorForRules";
import { createRootApiFileAstVisitorForRules } from "./createRootApiFileAstVisitorForRules";
import { getAllEnabledRules } from "./getAllRules";

export function validateFernWorkspace(workspace: FernWorkspace, logger: Logger): ValidationViolation[] {
    return runRulesOnWorkspace({ workspace, rules: getAllEnabledRules(), logger });
}

// exported for testing
export function runRulesOnWorkspace({
    workspace,
    rules,
    logger
}: {
    workspace: FernWorkspace;
    rules: Rule[];
    logger: Logger;
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    const allRuleVisitors = rules.map((rule) => rule.create({ workspace, logger }));

    const violationsForRoot = validateRootApiFile({
        contents: workspace.definition.rootApiFile.contents,
        allRuleVisitors
    });
    violations.push(...violationsForRoot);

    visitAllDefinitionFiles(workspace, (relativeFilepath, file) => {
        const violationsForFile = validateDefinitionFile({
            relativeFilepath,
            contents: file,
            allRuleVisitors
        });
        violations.push(...violationsForFile);
    });

    visitAllPackageMarkers(workspace, (relativeFilepath, file) => {
        const violationsForFile = validatePackageMarker({
            relativeFilepath,
            contents: file,
            allRuleVisitors
        });
        violations.push(...violationsForFile);
    });

    return violations;
}

function validateDefinitionFile({
    relativeFilepath,
    contents,
    allRuleVisitors
}: {
    relativeFilepath: RelativeFilePath;
    contents: DefinitionFileSchema;
    allRuleVisitors: RuleVisitors[];
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    const astVisitor = createDefinitionFileAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    visitDefinitionFileYamlAst(contents, astVisitor);

    return violations;
}

function validateRootApiFile({
    contents,
    allRuleVisitors
}: {
    contents: RootApiFileSchema;
    allRuleVisitors: RuleVisitors[];
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    const astVisitor = createRootApiFileAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(ROOT_API_FILENAME),
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    visitRootApiFileYamlAst(contents, astVisitor);

    return violations;
}

function validatePackageMarker({
    relativeFilepath,
    contents,
    allRuleVisitors
}: {
    relativeFilepath: RelativeFilePath;
    contents: PackageMarkerFileSchema;
    allRuleVisitors: RuleVisitors[];
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    const astVisitor = createPackageMarkerAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    visitPackageMarkerYamlAst(contents, astVisitor);

    return violations;
}
