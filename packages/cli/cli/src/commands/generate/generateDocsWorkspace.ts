import { createOrganizationIfDoesNotExist, FernToken, FernUserToken } from "@fern-api/auth";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Rules } from "@fern-api/docs-validator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";
import { isCI } from "../../utils/environment";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues";

export async function generateDocsWorkspace({
    project,
    cliContext,
    instance,
    preview,
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
    const isRunningOnSelfHosted = process.env["FERN_SELF_HOSTED"] === "true";

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
    if (isRunningOnSelfHosted) {
        const fernToken = process.env["FERN_TOKEN"]; // token can be a dummy token
        if (!fernToken) {
            cliContext.failAndThrow("No token found. Please set the FERN_TOKEN environment variable.");
            return;
        }
        token = {
            type: "organization",
            value: fernToken
        };
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

    if (!isRunningOnSelfHosted) {
        await cliContext.instrumentPostHogEvent({
            orgId: project.config.organization,
            command: "fern generate --docs"
        });
    }

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        await validateDocsWorkspaceAndLogIssues({
            workspace: docsWorkspace,
            context,
            logWarnings: false,
            apiWorkspaces: project.apiWorkspaces,
            ossWorkspaces: await filterOssWorkspaces(project),
            errorOnBrokenLinks: strictBrokenLinks,
            excludeRules: getExcludeRules(brokenLinks, strictBrokenLinks, isRunningOnSelfHosted)
        });

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
            disableTemplates,
            skipUpload
        });
        const generationTime = performance.now() - generationStart;
        context.logger.debug(`Remote docs generation completed in ${generationTime.toFixed(0)}ms`);
    });
}

function getExcludeRules(brokenLinks: boolean, strictBrokenLinks: boolean, isRunningOnSelfHosted: boolean): string[] {
    let excludeRules: string[] = [];
    if (!brokenLinks && !strictBrokenLinks) {
        excludeRules.push(Rules.ValidMarkdownLinks.name);
    }
    if (isRunningOnSelfHosted) {
        excludeRules.push(Rules.ValidFileTypes.name);
    }
    return excludeRules;
}
