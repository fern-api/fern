import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { visitFernRootApiFileYamlAst, visitFernServiceFileYamlAst } from "@fern-api/yaml-schema";
import stripAnsi from "strip-ansi";
import { createRootApiFileAstVisitorForRules } from "../createRootApiFileAstVisitorForRules";
import { createServiceFileAstVisitorForRules } from "../createServiceFileAstVisitorForRules";
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
        cliVersion: "0.0.0",
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
    }

    const ruleVisitors = await rule.create({ workspace: parseResult.workspace, logger: NOOP_LOGGER });
    const violations: ValidationViolation[] = [];

    const rootApiFileVisitor = createRootApiFileAstVisitorForRules({
        relativeFilepath: "api.yml",
        contents: parseResult.workspace.rootApiFile,
        allRuleVisitors: [ruleVisitors],
        addViolations: (newViolations) => {
            violations.push(...newViolations);
        },
    });

    await visitFernRootApiFileYamlAst(parseResult.workspace.rootApiFile, rootApiFileVisitor);

    for (const [relativeFilepath, contents] of entries(parseResult.workspace.serviceFiles)) {
        const visitor = createServiceFileAstVisitorForRules({
            relativeFilepath,
            contents,
            allRuleVisitors: [ruleVisitors],
            addViolations: (newViolations) => {
                violations.push(...newViolations);
            },
        });
        await visitFernServiceFileYamlAst(contents, visitor);
    }

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message),
    }));
}
