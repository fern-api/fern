import { mapValues } from 'lodash-es'

import { GeneratorName } from '@fern-api/configuration-loader'
import { assertNever } from '@fern-api/core-utils'

import { IrSerialization } from '../../ir-serialization'
import { IrVersions } from '../../ir-versions'
import { GeneratorWasNeverUpdatedToConsumeNewIR, GeneratorWasNotCreatedYet, IrMigration } from '../../types/IrMigration'

export const V56_TO_V55_MIGRATION: IrMigration<
    IrVersions.V56.ir.IntermediateRepresentation,
    IrVersions.V55.ir.IntermediateRepresentation
> = {
    laterVersion: 'v56',
    earlierVersion: 'v55',
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: '0.0.2',
        [GeneratorName.CSHARP_SDK]: '1.12.0-rc0',
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V55.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: 'strip',
            skipValidation: true
        }),
    migrateBackwards: (v56): IrVersions.V55.ir.IntermediateRepresentation => {
        return {
            ...v56,
            services: mapValues(v56.services, (service) => convertHttpService(service))
        }
    }
}

function convertHttpService(service: IrVersions.V56.http.HttpService): IrVersions.V55.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    }
}

function convertEndpoint(endpoint: IrVersions.V56.http.HttpEndpoint): IrVersions.V55.http.HttpEndpoint {
    return {
        ...endpoint,
        pagination: convertPagination(endpoint.pagination)
    }
}

function convertPagination(
    pagination: IrVersions.V56.http.Pagination | null | undefined
): IrVersions.V55.http.Pagination | undefined {
    if (pagination == null) {
        return undefined
    }
    switch (pagination.type) {
        case 'cursor':
            return IrVersions.V55.http.Pagination.cursor({
                next: pagination.next,
                page: pagination.page,
                results: pagination.results
            })
        case 'offset':
            return IrVersions.V55.http.Pagination.offset({
                hasNextPage: pagination.hasNextPage,
                page: pagination.page,
                results: pagination.results,
                step: pagination.step
            })
        case 'custom':
            return undefined
        default:
            assertNever(pagination)
    }
}
