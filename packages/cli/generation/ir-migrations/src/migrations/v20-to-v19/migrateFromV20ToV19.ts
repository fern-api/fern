import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrMigrationContext } from "../../IrMigrationContext";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V20_TO_V19_MIGRATION: IrMigration<
    IrVersions.V20.ir.IntermediateRepresentation,
    IrVersions.V19.ir.IntermediateRepresentation
> = {
    laterVersion: "v20",
    earlierVersion: "v19",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.5.26-rc0-3-gdfabd674",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.5.26-rc0-3-gdfabd674",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.20-3-g2505487f",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.20-3-g2505487f",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.3.10-rc2-1-g1c0d853",
        [GeneratorName.JAVA_SDK]: "0.3.10-rc2-1-g1c0d853",
        [GeneratorName.JAVA_SPRING]: "0.3.10-rc2-1-g1c0d853",
        [GeneratorName.PYTHON_FASTAPI]: "0.3.6-rc1-2-g6050f7f8",
        [GeneratorName.PYTHON_PYDANTIC]: "0.3.6-rc1-2-g6050f7f8",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.3.6-rc1-2-g6050f7f8",
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: "0.0.0",
        [GeneratorName.GO_SDK]: "0.0.0",
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
    migrateBackwards: (v20, context): IrVersions.V19.ir.IntermediateRepresentation => {
        return {
            ...v20,
            services: mapValues(v20.services, (service) => {
                return convertService(service, context);
            })
        };
    }
};

function convertService(
    service: IrVersions.V20.http.HttpService,
    context: IrMigrationContext
): IrVersions.V19.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint, context))
    };
}

function convertEndpoint(
    endpoint: IrVersions.V20.http.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V19.http.HttpEndpoint {
    return {
        ...endpoint,
        response: endpoint.response != null ? convertResponse(endpoint.response, context) : undefined,
        sdkResponse: endpoint.sdkResponse != null ? convertSdkResponse(endpoint.sdkResponse, context) : undefined
    };
}

function convertResponse(
    response: IrVersions.V20.http.HttpResponse,
    context: IrMigrationContext
): IrVersions.V19.http.NonStreamingResponse {
    return IrVersions.V20.http.HttpResponse._visit<IrVersions.V19.http.NonStreamingResponse>(response, {
        fileDownload: () => {
            return throwFileDownloadNotSupported(context);
        },
        json: (jsonResponse) => jsonResponse,
        _unknown: () => {
            throw new Error("Unknown HttpResponse: " + response.type);
        }
    });
}

function convertSdkResponse(
    sdkResponse: IrVersions.V20.http.SdkResponse,
    context: IrMigrationContext
): IrVersions.V19.http.SdkResponse {
    return IrVersions.V20.http.SdkResponse._visit<IrVersions.V19.http.SdkResponse>(sdkResponse, {
        fileDownload: () => {
            return throwFileDownloadNotSupported(context);
        },
        streaming: IrVersions.V19.http.SdkResponse.streaming,
        maybeStreaming: (maybeStreamingResponse) =>
            IrVersions.V19.http.SdkResponse.maybeStreaming({
                condition: maybeStreamingResponse.condition,
                streaming: maybeStreamingResponse.streaming,
                nonStreaming: convertResponse(maybeStreamingResponse.nonStreaming, context)
            }),
        json: IrVersions.V19.http.SdkResponse.nonStreaming,
        _unknown: () => {
            throw new Error("Unknown SdkResponse: " + sdkResponse.type);
        }
    });
}

function throwFileDownloadNotSupported({ targetGenerator, taskContext }: IrMigrationContext): never {
    return taskContext.failAndThrow(
        targetGenerator != null
            ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                  " does not support file download." +
                  ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                  " to a compatible version."
            : "Cannot backwards-migrate IR because this IR contains file download."
    );
}
