import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { Workspace } from "@fern-api/workspace-loader";
import {
    RootApiFileSchema,
    ServiceFileSchema,
    visitFernRootApiFileYamlAst,
    visitFernServiceFileYamlAst,
} from "@fern-api/yaml-schema";
import { createRootApiFileAstVisitorForRules } from "./createRootApiFileAstVisitorForRules";
import { createServiceFileAstVisitorForRules } from "./createServiceFileAstVisitorForRules";
import { getAllRules } from "./getAllRules";
import { ValidationViolation } from "./ValidationViolation";

export async function validateWorkspace(workspace: Workspace, logger: Logger): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    const violationsForRoot = await validateRootApiFile({
        workspace,
        contents: workspace.rootApiFile,
        logger,
    });
    violations.push(...violationsForRoot);

    for (const [relativeFilepath, contents] of entries(workspace.serviceFiles)) {
        const violationsForFile = await validateServiceFile({
            workspace,
            relativeFilepath,
            contents,
            logger,
        });
        violations.push(...violationsForFile);
    }

    return violations;
}

async function validateServiceFile({
    workspace,
    relativeFilepath,
    contents,
    logger,
}: {
    workspace: Workspace;
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema;
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const allRuleVisitors = await Promise.all(
        getAllRules()
            .filter(({ disabled = false }) => !disabled)
            .map((rule) => rule.create({ workspace, logger }))
    );

    const astVisitor = createServiceFileAstVisitorForRules({
        relativeFilepath,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernServiceFileYamlAst(contents, astVisitor);

    return violations;
}

async function validateRootApiFile({
    workspace,
    contents,
    logger,
}: {
    workspace: Workspace;
    contents: RootApiFileSchema;
    logger: Logger;
}): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    const allRuleVisitors = await Promise.all(getAllRules().map((rule) => rule.create({ workspace, logger })));

    const astVisitor = createRootApiFileAstVisitorForRules({
        relativeFilepath: ROOT_API_FILENAME,
        contents,
        allRuleVisitors,
        addViolations: (newViolations: ValidationViolation[]) => {
            violations.push(...newViolations);
        },
    });
    await visitFernRootApiFileYamlAst(contents, astVisitor);

    return violations;
}
