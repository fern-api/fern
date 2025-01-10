import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { logViolations } from "./logViolations";

export async function validateDocsBrokenLinks({
    project,
    cliContext,
    errorOnBrokenLinks
}: {
    project: Project;
    cliContext: CliContext;
    errorOnBrokenLinks: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;

    if (docsWorkspace == null) {
        // Should this fail and throw?
        return;
    }

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        const fernWorkspaces = await Promise.all(
            project.apiWorkspaces.map(async (workspace) => {
                return workspace.toFernWorkspace({ context });
            })
        );
        const violations = await validateDocsWorkspace(docsWorkspace, context, fernWorkspaces, true);
        logViolations({ violations, context, logWarnings: true, logSummary: true });

        if (violations.length > 0 && errorOnBrokenLinks) {
            context.failAndThrow();
        }
    });
}
