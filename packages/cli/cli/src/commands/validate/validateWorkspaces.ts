import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext.js";
import { ApiValidationResult, DocsValidationResult, printCheckReport } from "./printCheckReport.js";
import { collectAPIWorkspaceViolations } from "./validateAPIWorkspaceAndLogIssues.js";
import { collectDocsWorkspaceViolations } from "./validateDocsWorkspaceAndLogIssues.js";

export async function validateWorkspaces({
    project,
    cliContext,
    logWarnings,
    brokenLinks,
    errorOnBrokenLinks,
    isLocal,
    directFromOpenapi,
    outputJson
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
    brokenLinks: boolean;
    errorOnBrokenLinks: boolean;
    isLocal?: boolean;
    directFromOpenapi?: boolean;
    outputJson?: boolean;
}): Promise<void> {
    // When outputting JSON, clamp all stdout to stderr so nothing pollutes the JSON output.
    const originalStdoutWrite = process.stdout.write;
    if (outputJson) {
        process.stdout.write = process.stderr.write.bind(process.stderr) as typeof process.stdout.write;
    }

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

    if (outputJson) {
        // Restore stdout before writing JSON
        process.stdout.write = originalStdoutWrite;

        const showApiNames = apiResults.length > 1;
        const jsonResult = buildJsonResult({
            apiResults,
            docsResult,
            hasErrors: hasErrors || hasAnyErrors,
            showApiNames
        });
        process.stdout.write(JSON.stringify(jsonResult, null, 2) + "\n");
    }

    if (hasErrors || hasAnyErrors) {
        cliContext.failAndThrow();
    }
}

interface CheckJsonViolation {
    api?: string;
    severity: string;
    rule?: string;
    message: string;
}

interface CheckJsonResult {
    success: boolean;
    results: {
        apis: CheckJsonViolation[];
        docs: CheckJsonViolation[];
        sdks: CheckJsonViolation[];
    };
}

function buildJsonResult({
    apiResults,
    docsResult,
    hasErrors,
    showApiNames
}: {
    apiResults: ApiValidationResult[];
    docsResult: DocsValidationResult | undefined;
    hasErrors: boolean;
    showApiNames: boolean;
}): CheckJsonResult {
    const apis: CheckJsonViolation[] = [];
    for (const apiResult of apiResults) {
        for (const violation of apiResult.violations) {
            const entry: CheckJsonViolation = {
                severity: violation.severity,
                message: violation.message
            };
            if (showApiNames) {
                entry.api = apiResult.apiName;
            }
            if (violation.name != null) {
                entry.rule = violation.name;
            }
            apis.push(entry);
        }
    }

    const docs: CheckJsonViolation[] = [];
    if (docsResult != null) {
        for (const violation of docsResult.violations) {
            const entry: CheckJsonViolation = {
                severity: violation.severity,
                message: violation.message
            };
            if (violation.name != null) {
                entry.rule = violation.name;
            }
            docs.push(entry);
        }
    }

    return {
        success: !hasErrors,
        results: {
            apis,
            docs,
            sdks: []
        }
    };
}
