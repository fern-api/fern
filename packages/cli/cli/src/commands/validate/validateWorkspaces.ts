import { collectAPIWorkspaceViolations } from "@fern-api/api-workspace-validator";
import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import path from "path";
import { CliContext } from "../../cli-context/CliContext.js";
import { buildCheckJsonResult } from "./buildCheckJsonResult.js";
import { ApiValidationResult, DocsValidationResult, printCheckReport } from "./printCheckReport.js";
import { collectDocsWorkspaceViolations } from "./validateDocsWorkspaceAndLogIssues.js";
import { validateMdxFiles } from "./validateMdx.js";

export async function validateWorkspaces({
    project,
    cliContext,
    logWarnings,
    brokenLinks,
    errorOnBrokenLinks,
    isLocal,
    directFromOpenapi,
    commandLineApiWorkspace
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
    brokenLinks: boolean;
    errorOnBrokenLinks: boolean;
    isLocal?: boolean;
    directFromOpenapi?: boolean;
    /**
     * Optional `--api` filter. When provided, only the named API workspace is validated
     * for API-level rules. Docs validation always runs against the full set of API
     * workspaces because `docs.yml` may reference any/all APIs in the project (e.g. the
     * `valid-markdown-links` rule resolves an API definition for every `apiSection`).
     */
    commandLineApiWorkspace?: string;
}): Promise<void> {
    const apiResults: ApiValidationResult[] = [];
    let docsResult: DocsValidationResult | undefined;
    let hasAnyErrors = false;

    const apiWorkspacesToValidate =
        commandLineApiWorkspace != null
            ? project.apiWorkspaces.filter((workspace) => workspace.workspaceName === commandLineApiWorkspace)
            : project.apiWorkspaces;

    // Collect docs violations first (using runTaskForWorkspace to preserve [docs]: prefix for fatal errors)
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        const excludeRules = brokenLinks || errorOnBrokenLinks ? [] : ["valid-markdown-links"];
        const ossWorkspaces = await filterOssWorkspaces(project);
        const mdValidateSeverity = docsWorkspace.config.check?.rules?.mdValidate ?? "warn";

        let collected: Awaited<ReturnType<typeof collectDocsWorkspaceViolations>> | undefined;
        const mdxViolations: ValidationViolation[] = [];
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            collected = await collectDocsWorkspaceViolations({
                workspace: docsWorkspace,
                context,
                apiWorkspaces: project.apiWorkspaces,
                ossWorkspaces,
                errorOnBrokenLinks,
                excludeRules
            });

            // Run MDX parse validation (md-validate rule)
            try {
                const { errors } = await validateMdxFiles({ workspace: docsWorkspace, context });
                const severity: ValidationViolation["severity"] = mdValidateSeverity === "error" ? "error" : "warning";
                for (const error of errors) {
                    mdxViolations.push({
                        name: "md-validate",
                        severity,
                        relativeFilepath: RelativeFilePath.of(
                            path.relative(docsWorkspace.absoluteFilePath, error.filepath)
                        ),
                        nodePath: [],
                        message: error.message
                    });
                }
            } catch {
                // MDX validation requires a parseable docs config with navigation.
                // If the config is incomplete, skip MDX validation silently —
                // the rule-based validators will report the config error.
            }
        });

        if (collected != null || mdxViolations.length > 0) {
            docsResult = {
                violations: [...(collected?.violations ?? []), ...mdxViolations],
                elapsedMillis: collected?.elapsedMillis ?? 0
            };

            if (collected?.hasErrors || (mdValidateSeverity === "error" && mdxViolations.length > 0)) {
                hasAnyErrors = true;
            }
        }
    }

    // Collect API violations (using runTaskForWorkspace to preserve [api]: prefix for fatal errors)
    await Promise.all(
        apiWorkspacesToValidate.map(async (workspace) => {
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
                        return context.failAndThrow(undefined, undefined, { code: CliError.Code.ValidationError });
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

    if (cliContext.isJsonMode) {
        const showApiNames = apiResults.length > 1;
        cliContext.writeJsonToStdout(
            buildCheckJsonResult({ apiResults, docsResult, hasErrors: hasErrors || hasAnyErrors, showApiNames })
        );
    }

    if (hasErrors || hasAnyErrors) {
        cliContext.failAndThrow(undefined, undefined, { code: CliError.Code.ValidationError });
    }
}
