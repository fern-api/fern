import { createOrganizationIfDoesNotExist, FernToken, FernUserToken, getToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Rules } from "@fern-api/docs-validator";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { askToLogin } from "@fern-api/login";
import { validateOSSWorkspace } from "@fern-api/oss-validator";
import { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";
import { detectCISource, detectDeployerAuthor, isCI } from "../../utils/environment.js";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues.js";

const DOMAIN_SUFFIX = "docs.buildwithfern.com";
const SUBDOMAIN_LIMIT = 62;

/**
 * Sanitizes a preview ID to be valid in a DNS subdomain label.
 * Replaces invalid characters with hyphens, collapses consecutive hyphens,
 * strips leading/trailing hyphens, and lowercases.
 *
 * This MUST match the server-side sanitizePreviewId in FDR so the CLI
 * can accurately predict the preview URL.
 */
function sanitizePreviewId(id: string): string {
    const sanitized = id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    if (sanitized.length === 0) {
        return "default";
    }
    return sanitized;
}

/**
 * Replicates the server-side truncateDomainName logic so the CLI can predict
 * the preview URL for a given previewId before calling the FDR API.
 */
function buildPreviewDomain({ orgId, previewId }: { orgId: string; previewId: string }): string {
    const sanitizedId = sanitizePreviewId(previewId);
    const fullDomain = `${orgId}-preview-${sanitizedId}.${DOMAIN_SUFFIX}`;
    if (fullDomain.length <= SUBDOMAIN_LIMIT) {
        return fullDomain;
    }

    const prefix = `${orgId}-preview-`;
    const availableSpace = SUBDOMAIN_LIMIT - prefix.length;

    const minIdLength = 8;
    if (availableSpace < minIdLength) {
        throw new Error(`Organization name "${orgId}" is too long to generate a valid preview URL`);
    }

    const truncatedId = sanitizedId.slice(0, availableSpace).replace(/-+$/, "");
    return `${prefix}${truncatedId}.${DOMAIN_SUFFIX}`;
}

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
        cliContext.failAndThrow("No docs.yml file found. Please make sure your project has one.");
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
                "No token found. Please set the FERN_TOKEN environment variable or run `fern login`."
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

        const metadataResponse = await fdr.docs.v2.read.getDocsUrlMetadata({ url: FdrAPI.Url(expectedDomain) });
        if (metadataResponse.ok) {
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

        // Validate OpenAPI specs for issues that would cause runtime errors on the docs site
        const ossWorkspacesForValidation = await filterOssWorkspaces(project);
        for (const ossWorkspace of ossWorkspacesForValidation) {
            const violations = await validateOSSWorkspace(ossWorkspace, context);
            const errors = violations.filter((v) => v.severity === "fatal" || v.severity === "error");
            if (errors.length > 0) {
                for (const error of errors) {
                    context.logger.error(`${error.relativeFilepath}: ${error.message}`);
                }
                context.failAndThrow(
                    `OpenAPI spec validation failed with ${errors.length} error${errors.length !== 1 ? "s" : ""}. ` +
                        "Fix the errors above before generating docs."
                );
            }
        }

        context.logger.info("Validation complete, starting remote docs generation...");

        const filterStart = performance.now();
        const ossWorkspaces = await filterOssWorkspaces(project);
        const filterTime = performance.now() - filterStart;
        context.logger.debug(
            `Filtered OSS workspaces (${ossWorkspaces.length} workspaces) in ${filterTime.toFixed(0)}ms`
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
