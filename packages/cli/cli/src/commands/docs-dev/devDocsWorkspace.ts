import { runAppPreviewServer, runAstroPreviewServer, runPreviewServer } from "@fern-api/docs-preview";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext.js";
import { validateDocsWorkspaceWithoutExiting } from "../validate/validateDocsWorkspaceAndLogIssues.js";
import { getDocsDevExcludeRules } from "./getDocsDevExcludeRules.js";

export async function previewDocsWorkspace({
    loadProject,
    cliContext,
    port,
    bundlePath,
    brokenLinks,
    legacyPreview,
    astro,
    backendPort,
    forceDownload,
    includePrivate = false,
    skipApi = false,
    skipValidation = false
}: {
    loadProject: () => Promise<Project>;
    cliContext: CliContext;
    port: number;
    bundlePath?: string;
    brokenLinks: boolean;
    legacyPreview?: boolean;
    astro?: boolean;
    backendPort: number;
    forceDownload?: boolean;
    /** Include `x-twilio.docsVisibility: private` elements in the previewed API reference. */
    includePrivate?: boolean;
    /** Skip building API reference sections (much faster; API reference pages are empty). */
    skipApi?: boolean;
    /** Skip validating the docs (faster startup; docs errors are not reported). */
    skipValidation?: boolean;
}): Promise<void> {
    const project = await loadProject();
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow(
            "No docs.yml found in your Fern project. Add a docs.yml to configure your documentation site.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const validateProject = async (project: Project, context: TaskContext): Promise<void> => {
        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            return;
        }
        const openapiParserV3 = docsWorkspace.config.experimental?.openapiParserV3;
        const useV3Parser = openapiParserV3 == null || openapiParserV3;
        const excludeRules = getDocsDevExcludeRules({ brokenLinks, apiWorkspacesLoaded: !useV3Parser });
        await validateDocsWorkspaceWithoutExiting({
            workspace: docsWorkspace,
            context,
            logWarnings: true,
            logSummary: false,
            apiWorkspaces: useV3Parser ? [] : project.apiWorkspaces,
            ossWorkspaces: await filterOssWorkspaces(project),
            excludeRules
        });
    };

    if (astro) {
        cliContext.instrumentPostHogEvent({
            orgId: project.config.organization,
            command: "fern docs dev --astro"
        });

        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            context.logger.info("Bootstrapping Astro docs preview (this may take a few seconds)...");

            await runAstroPreviewServer({
                initialProject: project,
                reloadProject: loadProject,
                validateProject: (project) => validateProject(project, context),
                context,
                port,
                bundlePath,
                backendPort,
                forceDownload
            });
        });
        return;
    }

    if (legacyPreview) {
        cliContext.instrumentPostHogEvent({
            orgId: project.config.organization,
            command: "fern docs dev --legacy"
        });

        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            context.logger.info(`Starting server on port ${port}`);

            await runPreviewServer({
                initialProject: project,
                reloadProject: loadProject,
                validateProject: (project) => validateProject(project, context),
                context,
                port,
                bundlePath,
                includePrivate
            });
        });
    }

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern docs dev --beta"
    });

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        context.logger.info("Bootstrapping docs preview (this may take a few seconds)...");

        await runAppPreviewServer({
            initialProject: project,
            reloadProject: loadProject,
            validateProject: (project) => validateProject(project, context),
            context,
            port,
            bundlePath,
            backendPort,
            forceDownload,
            includePrivate,
            skipApi
        });
    });

    return;
}
