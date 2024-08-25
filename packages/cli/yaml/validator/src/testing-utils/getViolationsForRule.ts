import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import stripAnsi from "strip-ansi";
import { Rule } from "../Rule";
import { runRulesOnWorkspace } from "../validateFernWorkspace";
import { ValidationViolation } from "../ValidationViolation";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToWorkspace: AbsoluteFilePath;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToWorkspace
}: getViolationsForRule.Args): Promise<ValidationViolation[]> {
    const context = createMockTaskContext();
    const parseResult = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });
    if (!parseResult.didSucceed) {
        throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
    }

    if (parseResult.workspace.type === "oss") {
        throw new Error("Expected fern workspace, but received openapi");
    }

    const violations = await runRulesOnWorkspace({
        workspace: await parseResult.workspace.toFernWorkspace({ context }),
        logger: CONSOLE_LOGGER,
        rules: [rule]
    });

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message)
    }));
}
