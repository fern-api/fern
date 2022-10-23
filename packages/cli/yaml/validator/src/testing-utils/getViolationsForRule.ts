import { AbsoluteFilePath, entries } from "@fern-api/core-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { visitFernYamlAst } from "@fern-api/yaml-schema";
import stripAnsi from "strip-ansi";
import { createAstVisitorForRules } from "../createAstVisitorForRules";
import { Rule } from "../Rule";
import { ValidationViolation } from "../ValidationViolation";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToWorkspace: AbsoluteFilePath;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToWorkspace,
}: getViolationsForRule.Args): Promise<ValidationViolation[]> {
    const parseResult = await loadWorkspace({
        absolutePathToWorkspace,
        context: createMockTaskContext(),
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
    }

    const ruleRunner = await rule.create({ workspace: parseResult.workspace, logger: NOOP_LOGGER });
    const violations: ValidationViolation[] = [];

    const rootApiFileVisitor = createAstVisitorForRules({
        relativeFilepath: "api.yml",
        contents: parseResult.workspace.rootApiFile,
        ruleRunners: [ruleRunner],
        addViolations: (newViolations) => {
            violations.push(...newViolations);
        },
    });
    await visitFernYamlAst(parseResult.workspace.rootApiFile, rootApiFileVisitor);

    for (const [relativeFilepath, contents] of entries(parseResult.workspace.serviceFiles)) {
        const visitor = createAstVisitorForRules({
            relativeFilepath,
            contents,
            ruleRunners: [ruleRunner],
            addViolations: (newViolations) => {
                violations.push(...newViolations);
            },
        });
        await visitFernYamlAst(contents, visitor);
    }

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message),
    }));
}
