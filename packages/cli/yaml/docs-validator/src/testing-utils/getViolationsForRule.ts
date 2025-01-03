import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import stripAnsi from "strip-ansi";
import { Rule } from "../Rule";
import { runRulesOnDocsWorkspace } from "../validateDocsWorkspace";
import { ValidationViolation } from "../ValidationViolation";

export declare namespace getViolationsForRule {
    export interface Args {
        rule: Rule;
        absolutePathToFernDirectory: AbsoluteFilePath;
    }
}

export async function getViolationsForRule({
    rule,
    absolutePathToFernDirectory
}: getViolationsForRule.Args): Promise<ValidationViolation[]> {
    const context = createMockTaskContext();
    const project = await loadProjectFromDirectory({
        absolutePathToFernDirectory,
        context,
        cliVersion: "0.0.0",
        defaultToAllApiWorkspaces: true,
        commandLineApiWorkspace: undefined,
        cliName: "fern"
    });

    if (project.docsWorkspaces == null) {
        throw new Error("Expected docs workspace to be present, but found none");
    }

    const violations = await runRulesOnDocsWorkspace({
        workspace: project.docsWorkspaces,
        context,
        rules: [rule],
        loadApiWorkspace: project.loadAPIWorkspace
    });

    return violations.map((violation) => ({
        ...violation,
        message: stripAnsi(violation.message)
    }));
}
