import { RelativeFilePath, Workspace } from "@fern-api/workspace-parser";
import { FernConfigurationSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import path from "path";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { rules } from "./rules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateFernDefinition({
    workspace,
    absolutePathToWorkspaceDefinition,
}: {
    workspace: Workspace;
    absolutePathToWorkspaceDefinition: string;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    for (const [relativeFilePath, contents] of Object.entries(workspace.files)) {
        const absoluteFilePath = path.join(absolutePathToWorkspaceDefinition, relativeFilePath);
        const violationsForFile = await validateFernFile({
            workspace,
            absoluteFilePath,
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
    absoluteFilePath,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
    absoluteFilePath: string;
}): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    const ruleRunners = rules.map((rule) => rule.create({ workspace }));

    const astVisitor = createAstVisitorForRules({
        absoluteFilePath,
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
