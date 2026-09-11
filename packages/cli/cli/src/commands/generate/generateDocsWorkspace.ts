import { createOrganizationIfDoesNotExist, FernToken, FernUserToken, getToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { extractErrorMessage } from "@fern-api/core-utils";
import { buildPreviewDomain } from "@fern-api/docs-preview";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Rules } from "@fern-api/docs-validator";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { basename } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { type ValidationViolation, validateOSSWorkspace } from "@fern-api/oss-validator";
import { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";
import { detectCISource, detectDeployerAuthor, isCI } from "../../utils/environment.js";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues.js";

export async function generateDocsWorkspace({
    project,
    cliContext,
    instance,
    preview,
    previewId,
    force,
    brokenLinks,
    strictBrokenLinks,
    disableTemplates,
    noPrompt,
    skipUpload
}: {
    project: Project;
    cliContext: CliContext;
    instance: string | undefined;
    preview: boolean;
    previewId: string | undefined;
    force: boolean;
    brokenLinks: boolean;
    strictBrokenLinks: boolean;
    disableTemplates: boolean | undefined;
    noPrompt?: boolean;
    skipUpload: boolean | undefined;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs.yml file found. Please make sure your project has one.", undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }
    const hasFdrOriginOverride = !!process.env["FERN_FDR_ORIGIN"] || !!process.env["OVERRIDE_FDR_ORIGIN"];

    if (!preview && !isCI() && !noPrompt) {
        const productionUrl = instance ?? docsWorkspace.config.instances[0]?.url;
        const urlDisplay = productionUrl ? ` (${chalk.cyan(`https://${productionUrl}`)})` : "";

        const shouldContinue = await cliContext.confirmPrompt(
            `This will affect a production site${urlDisplay}. Run with --preview to generate docs for a preview instance.\n${chalk.yellow("?")} Are you sure you want to continue?`,
            false
        );
        if (!shouldContinue) {
            cliContext.logger.info("Docs generation cancelled.");
            return;
        }
    }

    let token: FernToken | null = null;
    if (hasFdrOriginOverride) {
        const fernToken = await getToken();
        if (!fernToken) {
            cliContext.failAndThrow(
                "No token found. Please set the FERN_TOKEN environment variable or run `fern login`.",
                undefined,
                { code: CliError.Code.AuthError }
            );
            return;
        }
        token = fernToken;
    } else {
        token = await cliContext.runTask(async (context) => {
            return askToLogin(context);
        });
        if (token.type === "user") {
            const userToken = token as FernUserToken;
            await cliContext.runTask(async (context) => {
                await createOrganizationIfDoesNotExist({
                    organization: project.config.organization,
                    token: userToken,
                    context
                });
            });
        }
    }

    // When --id is provided and we're not in CI and not --force, check if the preview already exists
    if (previewId != null && !isCI() && !force) {
        const expectedDomain = buildPreviewDomain({ orgId: project.config.organization, previewId });
        const fdr = createFdrService({ token: token.value });

        let metadataExists = false;
        try {
            await fdr.docs.v2.read.getDocsUrlMetadata({ url: FdrAPI.Url(expectedDomain) });
            metadataExists = true;
        } catch {
            // Preview doesn't exist yet, no need to prompt
        }
        if (metadataExists) {
            const shouldOverwrite = await cliContext.confirmPrompt(
                `This preview ID already exists for ${chalk.bold(project.config.organization)} (${chalk.cyan(`https://${expectedDomain}`)}). Are you sure you want to overwrite this?`,
                false
            );
            if (!shouldOverwrite) {
                cliContext.logger.info("Docs generation cancelled.");
                return;
            }
        }
    }

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate --docs"
    });

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        await validateDocsWorkspaceAndLogIssues({
            workspace: docsWorkspace,
            context,
            logWarnings: false,
            apiWorkspaces: project.apiWorkspaces,
            ossWorkspaces: await filterOssWorkspaces(project),
            errorOnBrokenLinks: strictBrokenLinks,
            excludeRules: getExcludeRules(brokenLinks, strictBrokenLinks)
        });

        // Validate OpenAPI specs — log errors for skipped APIs but never block docs generation.
        // Workspaces that fail validation or throw during loading are excluded from the
        // generation step so the rest of the docs can still be published.
        const skippedWorkspacePaths = new Set<string>();
        const ossWorkspacesForValidation = await filterOssWorkspaces(project);
        for (const ossWorkspace of ossWorkspacesForValidation) {
            const apiName = ossWorkspace.workspaceName ?? basename(ossWorkspace.absoluteFilePath);
            try {
                const violations = await validateOSSWorkspace(ossWorkspace, context);
                const errors = violations.filter((v) => v.severity === "fatal" || v.severity === "error");
                if (errors.length > 0) {
                    const reasons = summarizeValidationErrors(errors);
                    const reasonList = reasons.map((r) => `  - ${r}`).join("\n");
                    context.logger.error(
                        `Skipping API ${apiName} due to ${errors.length} validation error${errors.length !== 1 ? "s" : ""}:\n${reasonList}`
                    );
                    skippedWorkspacePaths.add(ossWorkspace.absoluteFilePath);
                }
            } catch (error) {
                context.logger.error(`Skipping API ${apiName}: ${extractErrorMessage(error)}`);
                skippedWorkspacePaths.add(ossWorkspace.absoluteFilePath);
            }
        }

        context.logger.info("Validation complete, starting remote docs generation...");

        const filterStart = performance.now();
        const allOssWorkspaces = await filterOssWorkspaces(project);
        const ossWorkspaces = allOssWorkspaces.filter((ws) => !skippedWorkspacePaths.has(ws.absoluteFilePath));
        const filterTime = performance.now() - filterStart;
        context.logger.debug(
            `Filtered OSS workspaces (${ossWorkspaces.length} workspaces, ${skippedWorkspacePaths.size} skipped) in ${filterTime.toFixed(0)}ms`
        );

        const generationStart = performance.now();
        await runRemoteGenerationForDocsWorkspace({
            organization: project.config.organization,
            apiWorkspaces: project.apiWorkspaces,
            ossWorkspaces,
            docsWorkspace,
            context,
            token,
            instanceUrl: instance,
            preview,
            previewId,
            disableTemplates,
            skipUpload,
            cliVersion: cliContext.environment.packageVersion,
            ciSource: detectCISource(),
            deployerAuthor: detectDeployerAuthor()
        });
        const generationTime = performance.now() - generationStart;
        context.logger.debug(`Remote docs generation completed in ${generationTime.toFixed(0)}ms`);
    });
}

function getExcludeRules(brokenLinks: boolean, strictBrokenLinks: boolean): string[] {
    const excludeRules: string[] = [];
    if (!brokenLinks && !strictBrokenLinks) {
        excludeRules.push(Rules.ValidMarkdownLinks.name);
    }
    return excludeRules;
}

/**
 * Aggregates validation errors into concise summary lines.
 * Groups repetitive violations (e.g., per-endpoint frontmatter warnings)
 * into single messages instead of one per endpoint.
 */
function summarizeValidationErrors(errors: ValidationViolation[]): string[] {
    const summaries: string[] = [];
    const frontmatterEndpoints: string[] = [];
    const nonAsciiTags: string[] = [];
    const otherErrors: ValidationViolation[] = [];

    for (const error of errors) {
        if (error.message.includes("---") && error.message.includes("frontmatter")) {
            const methodPathMatch = error.message.match(/for ((?:GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD|TRACE) \S+)/);
            frontmatterEndpoints.push(methodPathMatch?.[1] ?? error.nodePath.join("."));
        } else if (error.message.includes("non-ASCII")) {
            const tagMatch = error.message.match(/Tag name "([^"]+)"/);
            nonAsciiTags.push(tagMatch?.[1] ?? "unknown");
        } else {
            otherErrors.push(error);
        }
    }

    if (frontmatterEndpoints.length > 0) {
        summaries.push(
            `${frontmatterEndpoints.length} endpoint${frontmatterEndpoints.length !== 1 ? "s" : ""} contain "---" frontmatter delimiters that will cause 500 errors on the docs site`
        );
    }

    if (nonAsciiTags.length > 0) {
        summaries.push(
            `${nonAsciiTags.length} tag${nonAsciiTags.length !== 1 ? "s" : ""} contain non-ASCII characters: ${nonAsciiTags.join(", ")}`
        );
    }

    for (const error of otherErrors) {
        summaries.push(`${error.relativeFilepath}: ${error.message}`);
    }

    return summaries;
}
