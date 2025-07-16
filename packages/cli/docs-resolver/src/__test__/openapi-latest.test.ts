import { parseDocsConfiguration } from '@fern-api/configuration-loader'
import { FernNavigation } from '@fern-api/fdr-sdk'
import { AbsoluteFilePath, resolve } from '@fern-api/fs-utils'
import { OSSWorkspace } from '@fern-api/lazy-fern-workspace'
import { createMockTaskContext } from '@fern-api/task-context'
import { loadAPIWorkspace, loadDocsWorkspace } from '@fern-api/workspace-loader'

import { ApiReferenceNodeConverterLatest } from '../ApiReferenceNodeConverterLatest'
import { NodeIdGenerator } from '../NodeIdGenerator'
import { generateFdrFromOpenApiWorkspace } from '../utils/generateFdrFromOpenApiWorkspace'

const context = createMockTaskContext()

// biome-ignore lint/suspicious/noSkippedTests: allow
it.skip('converts to api reference latest node', async () => {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), 'fixtures/openapi-latest/fern'),
        context
    })

    if (docsWorkspace == null) {
        throw new Error('Workspace is null')
    }

    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    })

    if (parsedDocsConfig.navigation.type !== 'untabbed') {
        throw new Error('Expected untabbed navigation')
    }

    if (parsedDocsConfig.navigation.items[0]?.type !== 'apiSection') {
        throw new Error('Expected apiSection')
    }

    const apiSection = parsedDocsConfig.navigation.items[0]

    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: resolve(AbsoluteFilePath.of(__dirname), 'fixtures/openapi-latest/fern'),
        context,
        cliVersion: '0.0.0',
        workspaceName: undefined
    })

    if (!result.didSucceed) {
        throw new Error('API workspace failed to load')
    }

    const apiWorkspace = result.workspace

    if (!(apiWorkspace instanceof OSSWorkspace)) {
        throw new Error('Expected oss workspace')
    }

    const slug = FernNavigation.V1.SlugGenerator.init('/base/path')

    const api = await generateFdrFromOpenApiWorkspace(apiWorkspace, context)

    if (api == null) {
        throw new Error('API is null')
    }

    const node = new ApiReferenceNodeConverterLatest(
        apiSection,
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        api as any,
        slug,
        apiWorkspace,
        docsWorkspace,
        context,
        new Map(),
        new Map(),
        NodeIdGenerator.init()
    ).get()

    expect(node).toMatchSnapshot()
})
