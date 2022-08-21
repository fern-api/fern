import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateWorkspace(workspace: Workspace, context: TaskContext): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    for (const [relativeFilePath, contents] of entries(workspace.serviceFiles)) {
        const violationsForFile = await validateFernFile({
            workspace,
            relativeFilePath,
            contents,
            context,
        });
        violations.push(...violationsForFile);
    }
    return violations;
}

async function validateFernFile({
    workspace,
    relativeFilePath,
    contents,
    context,
}: {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: ServiceFileSchema;
    context: TaskContext;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const ruleRunners = await Promise.all(
        getAllRules().map((rule) => rule.create({ workspace, logger: context.logger }))
    );

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
