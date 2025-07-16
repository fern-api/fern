import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrMigrationContext } from "../../IrMigrationContext";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V21_TO_V20_MIGRATION: IrMigration<
    IrVersions.V21.ir.IntermediateRepresentation,
    IrVersions.V20.ir.IntermediateRepresentation
> = {
    laterVersion: "v21",
    earlierVersion: "v20",
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
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
    migrateBackwards: (v21, context): IrVersions.V20.ir.IntermediateRepresentation => {
        return {
            ...v21,
            services: mapValues(v21.services, (service) => {
                return convertService(service, context);
            })
        };
    }
};

function convertService(
    service: IrVersions.V21.http.HttpService,
    context: IrMigrationContext
): IrVersions.V20.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint, context))
    };
}

function convertEndpoint(
    endpoint: IrVersions.V21.http.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V20.http.HttpEndpoint {
    return {
        ...endpoint,
        streamingResponse:
            endpoint.streamingResponse != null
                ? convertStreamingResponse(endpoint.streamingResponse, context)
                : undefined,
        sdkResponse: endpoint.sdkResponse != null ? convertSdkResponse(endpoint.sdkResponse, context) : undefined
    };
}

function convertStreamingResponse(
    response: IrVersions.V21.http.StreamingResponse,
    { taskContext, targetGenerator }: IrMigrationContext
): IrVersions.V20.http.StreamingResponse {
    return {
        dataEventType: IrVersions.V21.http.StreamingResponseChunkType._visit(response.dataEventType, {
            json: (jsonType) => jsonType,
            text: () => {
                return taskContext.failAndThrow(
                    targetGenerator != null
                        ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                              " does not support streaming text responses." +
                              ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                              " to a compatible version."
                        : "Cannot backwards-migrate IR because this IR contains streaming text responses."
                );
            },
            _unknown: () => {
                throw new Error("Unknown StreamingResponseChunkType: " + response.dataEventType.type);
            }
        }),
        terminator: response.terminator
    };
}

function convertSdkResponse(
    sdkResponse: IrVersions.V21.http.SdkResponse,
    context: IrMigrationContext
): IrVersions.V20.http.SdkResponse {
    return IrVersions.V21.http.SdkResponse._visit<IrVersions.V20.http.SdkResponse>(sdkResponse, {
        fileDownload: IrVersions.V20.http.SdkResponse.fileDownload,
        streaming: (streamingResponse) =>
            IrVersions.V20.http.SdkResponse.streaming(convertStreamingResponse(streamingResponse, context)),
        maybeStreaming: (maybeStreamingResponse) =>
            IrVersions.V20.http.SdkResponse.maybeStreaming({
                condition: maybeStreamingResponse.condition,
                streaming: convertStreamingResponse(maybeStreamingResponse.streaming, context),
                nonStreaming: maybeStreamingResponse.nonStreaming
            }),
        json: IrVersions.V20.http.SdkResponse.json,
        _unknown: () => {
            throw new Error("Unknown SdkResponse: " + sdkResponse.type);
        }
    });
}
