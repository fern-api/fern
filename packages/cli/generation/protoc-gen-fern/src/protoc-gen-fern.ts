import { create, protoInt64 } from '@bufbuild/protobuf'
import { type SupportedEdition, maximumEdition, minimumEdition } from '@bufbuild/protobuf'
import type { CodeGeneratorRequest, CodeGeneratorResponse } from '@bufbuild/protobuf/wkt'
import { CodeGeneratorResponseSchema, CodeGeneratorResponse_Feature } from '@bufbuild/protobuf/wkt'
import { FileInfo, Plugin } from '@bufbuild/protoplugin'

import { version } from '../package.json'
import { generateIr } from './generateIr'
import { Options, parseOptions } from './parseOptions'

export const protocGenFern = createPlugin({
    name: 'protoc-gen-fern',
    version: `v${String(version)}`,
    run: generateIr
})

function createPlugin({
    name,
    version,
    run
}: {
    name: string
    version: string
    run: ({ req, options }: { req: CodeGeneratorRequest; options: Options }) => FileInfo
}): Plugin {
    return {
        name,
        version,
        run(req) {
            const options = parseOptions(req.parameter)
            const fileInfo = run({ req, options })
            return toResponse([fileInfo], minimumEdition, maximumEdition)
        }
    }
}

function toResponse(
    files: FileInfo[],
    minimumEdition: SupportedEdition,
    maximumEdition: SupportedEdition
): CodeGeneratorResponse {
    return create(CodeGeneratorResponseSchema, {
        supportedFeatures: protoInt64.parse(
            CodeGeneratorResponse_Feature.PROTO3_OPTIONAL | CodeGeneratorResponse_Feature.SUPPORTS_EDITIONS
        ),
        minimumEdition,
        maximumEdition,
        file: files
    })
}
