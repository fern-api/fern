import { GENERATORS_CONFIGURATION_FILENAME, generatorsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernWorkspace } from "@fern-api/workspace-loader";

import { Rule, RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";
import { visitGeneratorsYamlAst } from "./ast/visitGeneratorsYamlAst";
import { createGeneratorsYmlAstVisitorForRules } from "./createGeneratorsYmlAstVisitorForRules";
import { getAllRules } from "./getAllRules";

export async function validateGeneratorsWorkspace(
    workspace: FernWorkspace,
    logger: Logger
): Promise<ValidationViolation[]> {
    return runRulesOnWorkspace({ workspace, rules: getAllRules(), logger });
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
        const violationsForGeneratorsYml = await validateGeneratorsYmlFile({
            contents: workspace.generatorsConfiguration.rawConfiguration,
            allRuleVisitors,
            cliVersion: workspace.cliVersion
        });
        violations.push(...violationsForGeneratorsYml);
    }

    return violations;
}

async function validateGeneratorsYmlFile({
    contents,
    allRuleVisitors,
    cliVersion
}: {
    contents: generatorsYml.GeneratorsConfigurationSchema;
    allRuleVisitors: RuleVisitors[];
    cliVersion: string;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const astVisitor = createGeneratorsYmlAstVisitorForRules({
        relativeFilepath: RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME),
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        }
    });
    await visitGeneratorsYamlAst(contents, cliVersion, astVisitor);

    return violations;
}
