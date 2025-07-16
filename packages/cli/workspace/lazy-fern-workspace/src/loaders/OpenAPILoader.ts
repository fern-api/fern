import { readFile } from 'fs/promises'

import { OpenAPISpec, isOpenAPIV2, isOpenAPIV3 } from '@fern-api/api-workspace-commons'
import { AbsoluteFilePath, join, relative } from '@fern-api/fs-utils'
import { Source as OpenApiIrSource } from '@fern-api/openapi-ir'
import { Document, getParseOptions } from '@fern-api/openapi-ir-parser'
import { TaskContext } from '@fern-api/task-context'

import { convertOpenAPIV2ToV3 } from '../utils/convertOpenAPIV2ToV3'
import { loadAsyncAPI } from '../utils/loadAsyncAPI'
import { loadOpenAPI } from '../utils/loadOpenAPI'

export class OpenAPILoader {
    constructor(private readonly absoluteFilePath: AbsoluteFilePath) {}

    public async loadDocuments({
        context,
        specs
    }: {
        context: TaskContext
        specs: OpenAPISpec[]
    }): Promise<Document[]> {
        const documents: Document[] = []
        for (const spec of specs) {
            const contents = (await readFile(spec.absoluteFilepath)).toString()
            let sourceRelativePath = relative(this.absoluteFilePath, spec.source.file)
            if (spec.source.relativePathToDependency != null) {
                sourceRelativePath = join(spec.source.relativePathToDependency, sourceRelativePath)
            }
            const source =
                spec.source.type === 'protobuf'
                    ? OpenApiIrSource.protobuf({ file: sourceRelativePath })
                    : OpenApiIrSource.openapi({ file: sourceRelativePath })
            if (contents.includes('openapi') || contents.includes('swagger')) {
                const openAPI = await loadOpenAPI({
                    absolutePathToOpenAPI: spec.absoluteFilepath,
                    context,
                    absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides
                })
                if (isOpenAPIV3(openAPI)) {
                    documents.push({
                        type: 'openapi',
                        value: openAPI,
                        source,
                        namespace: spec.namespace,
                        settings: getParseOptions({ options: spec.settings })
                    })
                    continue
                } else if (isOpenAPIV2(openAPI)) {
                    const convertedOpenAPI = await convertOpenAPIV2ToV3(openAPI)
                    documents.push({
                        type: 'openapi',
                        value: convertedOpenAPI,
                        source,
                        namespace: spec.namespace,
                        settings: getParseOptions({ options: spec.settings })
                    })
                    continue
                }
            }
            if (contents.includes('asyncapi')) {
                const asyncAPI = await loadAsyncAPI({
                    context,
                    absoluteFilePath: spec.absoluteFilepath,
                    absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                })
                documents.push({
                    type: 'asyncapi',
                    value: asyncAPI,
                    source,
                    namespace: spec.namespace,
                    settings: getParseOptions({ options: spec.settings })
                })
                continue
            }
            if (contents.includes('openrpc')) {
                const asyncAPI = await loadAsyncAPI({
                    context,
                    absoluteFilePath: spec.absoluteFilepath,
                    absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                })
                documents.push({
                    type: 'asyncapi',
                    value: asyncAPI,
                    source,
                    namespace: spec.namespace,
                    settings: getParseOptions({ options: spec.settings })
                })
                continue
            }
            context.failAndThrow(`${spec.absoluteFilepath} is not a valid OpenAPI or AsyncAPI file`)
        }
        return documents
    }
}
