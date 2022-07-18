import { RelativeFilePath, Workspace } from "@fern-api/workspace-parser";
import { FernConfigurationSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { rules } from "./rules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateFernDefinition(workspace: Workspace): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    for (const [relativeFilePath, contents] of Object.entries(workspace.files)) {
        const violationsForFile = await validateFernFile({
            workspace,
            relativeFilePath,
            contents,
        });
        violations.push(...violationsForFile);
    }
    return violations;
}

function validateFernFile({
    workspace,
    relativeFilePath,
    contents,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    const ruleRunners = rules.map((rule) => rule.create({ workspace }));

    const astVisitor = createAstVisitorForRules({
        relativeFilePath,
        contents,
        ruleRunners,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    visitFernYamlAst(contents, astVisitor);

    return violations;
}
