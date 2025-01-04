import stripAnsi from "strip-ansi";

import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { Rule } from "../Rule";
import { ValidationViolation } from "../ValidationViolation";
import { runRulesOnWorkspace } from "../validateFernWorkspace";

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

    const lazyWorkspace = new LazyFernWorkspace({
        absoluteFilePath: absolutePathToWorkspace,
        generatorsConfiguration: await loadGeneratorsConfiguration({
            absolutePathToWorkspace,
            context
        }),
        context,
        cliVersion: cliVersion ?? "0.0.0",
        workspaceName: undefined
    });
    const fernWorkspace = await lazyWorkspace.toFernWorkspace({ context });

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
