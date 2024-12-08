import { generatorsYml, ROOT_API_FILENAME, GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernWorkspace, visitAllDefinitionFiles, visitAllPackageMarkers } from "@fern-api/api-workspace-commons";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { createDefinitionFileAstVisitorForRules } from "./createDefinitionFileAstVisitorForRules";
import { createPackageMarkerAstVisitorForRules } from "./createPackageMarkerAstVisitorForRules";
import { createRootApiFileAstVisitorForRules } from "./createRootApiFileAstVisitorForRules";
import { getAllEnabledRules } from "./getAllRules";
import { Rule, RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";
import { visitRootApiFileYamlAst, visitPackageMarkerYamlAst, visitDefinitionFileYamlAst } from "./ast";
import { createGeneratorsYmlAstVisitorForRules } from "./createGeneratorsYmlAstVisitorForRules";
import { visitGeneratorsYamlAst } from "./ast/visitGeneratorsYamlAst";

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

    if (workspace.generatorsConfiguration?.rawConfiguration) {
        const violationsForGeneratorsYml = validateGeneratorsYmlFile({
            contents: workspace.generatorsConfiguration.rawConfiguration,
            allRuleVisitors,
            cliVersion: workspace.cliVersion
        });
        violations.push(...violationsForGeneratorsYml);
    }

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

function validateGeneratorsYmlFile({
    contents,
    allRuleVisitors,
    cliVersion
}: {
    contents: generatorsYml.GeneratorsConfigurationSchema;
    allRuleVisitors: RuleVisitors[];
    cliVersion: string;
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    const astVisitor = createGeneratorsYmlAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME),
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    visitGeneratorsYamlAst(contents, cliVersion, astVisitor);

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
