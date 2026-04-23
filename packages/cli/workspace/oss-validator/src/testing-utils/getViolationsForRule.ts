import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { CliError, createMockTaskContext } from "@fern-api/task-context";

import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import stripAnsi from "strip-ansi";

import { Rule } from "../Rule.js";
import { ValidationViolation } from "../ValidationViolation.js";
import { runRulesOnOSSWorkspace } from "../validateOSSWorkspace.js";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToWorkspace: AbsoluteFilePath;
        cliVersion?: string;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToWorkspace,
    cliVersion
}: getViolationsForRule.Args): Promise<ValidationViolation[]> {
    const context = createMockTaskContext();
    const result = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });

    if (!result.didSucceed) {
        throw new CliError({ message: "API workspace failed to load", code: CliError.Code.InternalError });
    }

    if (!(result.workspace instanceof OSSWorkspace)) {
        throw new CliError({
            message: "Expected an OSS workspace but got a different type",
            code: CliError.Code.InternalError
        });
    }

    const violations = await runRulesOnOSSWorkspace({
        workspace: result.workspace as OSSWorkspace,
        context,
        rules: [rule]
    });

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message)
    }));
}
