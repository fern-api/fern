import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
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

    // Collect docs violations first (using runTaskForWorkspace to preserve [docs]: prefix for fatal errors)
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        const excludeRules = brokenLinks || errorOnBrokenLinks ? [] : ["valid-markdown-links"];
        const ossWorkspaces = await filterOssWorkspaces(project);

        let collected: Awaited<ReturnType<typeof collectDocsWorkspaceViolations>> | undefined;
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            collected = await collectDocsWorkspaceViolations({
                workspace: docsWorkspace,
                context,
                apiWorkspaces: project.apiWorkspaces,
                ossWorkspaces,
                errorOnBrokenLinks,
                excludeRules
            });
        });

        if (collected != null) {
            docsResult = {
                violations: collected.violations,
                elapsedMillis: collected.elapsedMillis
            };

            if (collected.hasErrors) {
                hasAnyErrors = true;
            }
        }
    }

    // Collect API violations (using runTaskForWorkspace to preserve [api]: prefix for fatal errors)
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (workspace.generatorsConfiguration?.groups.length === 0 && workspace.type !== "fern") {
                return;
            }

            if (workspace instanceof OSSWorkspace && directFromOpenapi) {
                // For --from-openapi, run IR generation which logs its own errors
                await cliContext.runTaskForWorkspace(workspace, async (context) => {
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

            // For LazyFernWorkspace, check if api.yml exists before running validation.
            // If it doesn't exist, we want to log the error WITHOUT the [api]: prefix.
            // All other errors (including dependency errors) should have the [api]: prefix.
            if (workspace instanceof LazyFernWorkspace) {
                const absolutePathToApiYml = join(
                    workspace.absoluteFilePath,
                    RelativeFilePath.of(DEFINITION_DIRECTORY),
                    RelativeFilePath.of(ROOT_API_FILENAME)
                );
                const apiYmlExists = await doesPathExist(absolutePathToApiYml);
                if (!apiYmlExists) {
                    // Log the missing file error without the [api]: prefix
                    await cliContext.runTask(async (context) => {
                        context.logger.error(`Missing file: ${ROOT_API_FILENAME}`);
                        return context.failAndThrow();
                    });
                    return;
                }
            }

            // Run toFernWorkspace and validation inside runTaskForWorkspace so that
            // dependency errors and other validation errors get the [api]: prefix
            let collected: Awaited<ReturnType<typeof collectAPIWorkspaceViolations>> | undefined;
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context });
                collected = await collectAPIWorkspaceViolations({
                    workspace: fernWorkspace,
                    context,
                    ossWorkspace: workspace instanceof OSSWorkspace ? workspace : undefined
                });
            });

            if (collected != null) {
                apiResults.push({
                    apiName: collected.apiName,
                    violations: collected.violations,
                    elapsedMillis: collected.elapsedMillis
                });

                if (collected.hasErrors) {
                    hasAnyErrors = true;
                }
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
