import { RelativeFilePath } from "@fern-api/config-management-commons";
import { entries } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-parser";
import { FernConfigurationSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { rules } from "./rules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateFernDefinition(workspace: Workspace): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    for (const [relativeFilePath, contents] of entries(workspace.files)) {
        const violationsForFile = await validateFernFile({
            workspace,
            relativeFilePath,
            contents,
        });
        violations.push(...violationsForFile);
    }
    return violations;
}

async function validateFernFile({
    workspace,
    relativeFilePath,
    contents,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const ruleRunners = await Promise.all(rules.map((rule) => rule.create({ workspace })));

    const astVisitor = createAstVisitorForRules({
        relativeFilePath,
        contents,
        ruleRunners,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernYamlAst(contents, astVisitor);

    return violations;
}
