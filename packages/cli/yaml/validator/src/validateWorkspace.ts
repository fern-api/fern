import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { Workspace } from "@fern-api/workspace-loader";
import { RootApiFileSchema, ServiceFileSchema, visitFernYamlAst } from "@fern-api/yaml-schema";
import { createAstVisitorForRules } from "./createAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateWorkspace(workspace: Workspace, logger: Logger): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const violationsForRoot = await validateFernFile({
        workspace,
        relativeFilepath: "api.yml",
        contents: workspace.rootApiFile,
        logger,
    });
    violations.push(...violationsForRoot);

    for (const [relativeFilepath, contents] of entries(workspace.serviceFiles)) {
        const violationsForFile = await validateFernFile({
            workspace,
            relativeFilepath,
            contents,
            logger,
        });
        violations.push(...violationsForFile);
    }

    return violations;
}

async function validateFernFile({
    workspace,
    relativeFilepath,
    contents,
    logger,
}: {
    workspace: Workspace;
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema | RootApiFileSchema;
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const ruleRunners = await Promise.all(getAllRules().map((rule) => rule.create({ workspace, logger })));

    const astVisitor = createAstVisitorForRules({
        relativeFilepath,
        contents,
        ruleRunners,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernYamlAst(contents, astVisitor);

    return violations;
}
