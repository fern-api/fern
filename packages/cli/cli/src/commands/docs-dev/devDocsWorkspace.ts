import { runAppPreviewServer, runPreviewServer } from '@fern-api/docs-preview'
import { filterOssWorkspaces } from '@fern-api/docs-resolver'
import { Project } from '@fern-api/project-loader'

import { CliContext } from '../../cli-context/CliContext'
import { validateDocsWorkspaceWithoutExiting } from '../validate/validateDocsWorkspaceAndLogIssues'

export async function previewDocsWorkspace({
    loadProject,
    cliContext,
    port,
    bundlePath,
    brokenLinks,
    legacyPreview,
    backendPort
}: {
    loadProject: () => Promise<Project>
    cliContext: CliContext
    port: number
    bundlePath?: string
    brokenLinks: boolean
    legacyPreview?: boolean
    backendPort: number
}): Promise<void> {
    const project = await loadProject()
    const docsWorkspace = project.docsWorkspaces
    if (docsWorkspace == null) {
        return
    }

    if (legacyPreview) {
        await cliContext.instrumentPostHogEvent({
            orgId: project.config.organization,
            command: 'fern docs dev --legacy'
        })

        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            context.logger.info(`Starting server on port ${port}`)

            await runPreviewServer({
                initialProject: project,
                reloadProject: loadProject,
                validateProject: async (project) => {
                    const docsWorkspace = project.docsWorkspaces
                    if (docsWorkspace == null) {
                        return
                    }
                    const excludeRules = brokenLinks ? [] : ['valid-markdown-links']
                    const openapiParserV3 = docsWorkspace.config.experimental?.openapiParserV3
                    const useV3Parser = openapiParserV3 == null || openapiParserV3
                    if (useV3Parser) {
                        await validateDocsWorkspaceWithoutExiting({
                            workspace: docsWorkspace,
                            context,
                            logWarnings: true,
                            logSummary: false,
                            apiWorkspaces: [],
                            ossWorkspaces: await filterOssWorkspaces(project),
                            excludeRules
                        })
                    } else {
                        await validateDocsWorkspaceWithoutExiting({
                            workspace: docsWorkspace,
                            context,
                            logWarnings: true,
                            logSummary: false,
                            apiWorkspaces: project.apiWorkspaces,
                            ossWorkspaces: await filterOssWorkspaces(project),
                            excludeRules
                        })
                    }
                },
                context,
                port,
                bundlePath
            })
        })
    }

    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: 'fern docs dev --beta'
    })

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        context.logger.info(`Starting server on port ${port}`)

        await runAppPreviewServer({
            initialProject: project,
            reloadProject: loadProject,
            validateProject: async (project) => {
                const docsWorkspace = project.docsWorkspaces
                if (docsWorkspace == null) {
                    return
                }
                const excludeRules = brokenLinks ? [] : ['valid-markdown-links']
                const openapiParserV3 = docsWorkspace.config.experimental?.openapiParserV3
                const useV3Parser = openapiParserV3 == null || openapiParserV3
                if (useV3Parser) {
                    await validateDocsWorkspaceWithoutExiting({
                        workspace: docsWorkspace,
                        context,
                        logWarnings: true,
                        logSummary: false,
                        apiWorkspaces: [],
                        ossWorkspaces: await filterOssWorkspaces(project),
                        excludeRules
                    })
                } else {
                    await validateDocsWorkspaceWithoutExiting({
                        workspace: docsWorkspace,
                        context,
                        logWarnings: true,
                        logSummary: false,
                        apiWorkspaces: project.apiWorkspaces,
                        ossWorkspaces: await filterOssWorkspaces(project),
                        excludeRules
                    })
                }
            },
            context,
            port,
            bundlePath,
            backendPort
        })
    })

    return
}
