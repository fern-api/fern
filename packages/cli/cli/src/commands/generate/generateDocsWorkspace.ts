import { createOrganizationIfDoesNotExist, FernToken, FernUserToken } from "@fern-api/auth";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Rules } from "@fern-api/docs-validator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";

import { CliContext } from "../../cli-context/CliContext";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues";

export async function generateDocsWorkspace({
    project,
    cliContext,
    instance,
    preview,
    brokenLinks,
    strictBrokenLinks,
    disableTemplates,
    disableDynamicSnippets
}: {
    project: Project;
    cliContext: CliContext;
    instance: string | undefined;
    preview: boolean;
    brokenLinks: boolean;
    strictBrokenLinks: boolean;
    disableTemplates: boolean | undefined;
    disableDynamicSnippets: boolean | undefined;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs.yml file found. Please make sure your project has one.");
        return;
    }
    const isRunningOnSelfHosted = process.env["FERN_SELF_HOSTED"] === "true";

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

        const ossWorkspaces = await filterOssWorkspaces(project);

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
            disableDynamicSnippets
        });
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
