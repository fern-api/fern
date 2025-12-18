import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { ApiValidationResult, DocsValidationResult, printCheckReport } from "./printCheckReport";
import { collectAPIWorkspaceViolations } from "./validateAPIWorkspaceAndLogIssues";
import { collectDocsWorkspaceViolations } from "./validateDocsWorkspaceAndLogIssues";

export async function validateWorkspaces({
    project,
    cliContext,
    logWarnings,
    brokenLinks,
    errorOnBrokenLinks,
    isLocal,
    directFromOpenapi
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
    brokenLinks: boolean;
    errorOnBrokenLinks: boolean;
    isLocal?: boolean;
    directFromOpenapi?: boolean;
}): Promise<void> {
    const apiResults: ApiValidationResult[] = [];
    let docsResult: DocsValidationResult | undefined;
    let hasAnyErrors = false;

    // Collect docs violations first (using runTask to get a proper TaskContext)
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        const excludeRules = brokenLinks || errorOnBrokenLinks ? [] : ["valid-markdown-links"];
        const ossWorkspaces = await filterOssWorkspaces(project);

        const collected = await cliContext.runTask(async (context) => {
            return collectDocsWorkspaceViolations({
                workspace: docsWorkspace,
                context,
                apiWorkspaces: project.apiWorkspaces,
                ossWorkspaces,
                errorOnBrokenLinks,
                excludeRules
            });
        });

        docsResult = {
            violations: collected.violations,
            elapsedMillis: collected.elapsedMillis
        };

        if (collected.hasErrors) {
            hasAnyErrors = true;
        }
    }

    // Collect API violations (using runTask to get a proper TaskContext)
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (workspace.generatorsConfiguration?.groups.length === 0 && workspace.type !== "fern") {
                return;
            }

            if (workspace instanceof OSSWorkspace && directFromOpenapi) {
                // For --from-openapi, run IR generation which logs its own errors
                await cliContext.runTask(async (context) => {
                    await workspace.getIntermediateRepresentation({
                        context,
                        audiences: { type: "all" },
                        enableUniqueErrorsPerEndpoint: false,
                        generateV1Examples: false,
                        logWarnings: logWarnings
                    });
                });
                return;
            }

            const collected = await cliContext.runTask(async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context });
                return collectAPIWorkspaceViolations({
                    workspace: fernWorkspace,
                    context,
                    ossWorkspace: workspace instanceof OSSWorkspace ? workspace : undefined
                });
            });

            apiResults.push({
                apiName: collected.apiName,
                violations: collected.violations,
                elapsedMillis: collected.elapsedMillis
            });

            if (collected.hasErrors) {
                hasAnyErrors = true;
            }
        })
    );

    // Print the aggregated report (using runTask to get a proper TaskContext)
    const { hasErrors } = await cliContext.runTask((context) => {
        return printCheckReport({
            apiResults,
            docsResult,
            logWarnings,
            context
        });
    });

    if (hasErrors || hasAnyErrors) {
        cliContext.failAndThrow();
    }
}
