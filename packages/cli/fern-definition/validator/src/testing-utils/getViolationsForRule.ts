import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import stripAnsi from "strip-ansi";
import { Rule } from "../Rule";
import { runRulesOnWorkspace } from "../validateFernWorkspace";
import { ValidationViolation } from "../ValidationViolation";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToWorkspace: AbsoluteFilePath;
        cliVersion?: string;
    }
}

export function getViolationsForRule({
    rule,
    absolutePathToWorkspace,
    cliVersion
}: getViolationsForRule.Args): ValidationViolation[] {
    const context = createMockTaskContext();

    const lazyWorkspace = new LazyFernWorkspace({
        absoluteFilePath: absolutePathToWorkspace,
        generatorsConfiguration: loadGeneratorsConfiguration({
            absolutePathToWorkspace,
            context
        }),
        context,
        cliVersion: cliVersion ?? "0.0.0",
        workspaceName: undefined
    });
    const fernWorkspace = lazyWorkspace.toFernWorkspace({ context });

    const violations = runRulesOnWorkspace({
        workspace: fernWorkspace,
        logger: CONSOLE_LOGGER,
        rules: [rule]
    });

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message)
    }));
}
