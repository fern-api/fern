import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import validatePackageName from "validate-npm-package-name";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateWorkspace(workspace: Workspace): Promise<ValidationViolation[]> {
    validateWorkspaceName(workspace.name);

    const violations: ValidationViolation[] = [];
    for (const [relativeFilePath, contents] of entries(workspace.serviceFiles)) {
        const violationsForFile = await validateFernFile({
            workspace,
            relativeFilePath,
            contents,
        });
        violations.push(...violationsForFile);
    }
    return violations;
}

function validateWorkspaceName(workspaceName: string) {
    const { validForNewPackages } = validatePackageName(workspaceName);
    if (!validForNewPackages) {
        throw new Error(`Invalid workspace name: ${workspaceName}`);
    }
}

async function validateFernFile({
    workspace,
    relativeFilePath,
    contents,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: ServiceFileSchema;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const ruleRunners = await Promise.all(getAllRules().map((rule) => rule.create({ workspace })));

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
