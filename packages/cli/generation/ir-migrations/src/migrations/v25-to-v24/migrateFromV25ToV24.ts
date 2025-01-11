import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V25_TO_V24_MIGRATION: IrMigration<
    IrVersions.V25.ir.IntermediateRepresentation,
    IrVersions.V24.ir.IntermediateRepresentation
> = {
    laterVersion: "v25",
    earlierVersion: "v24",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.4.9-1-ge0997b3",
        [GeneratorName.JAVA_SDK]: "0.4.9-1-ge0997b3",
        [GeneratorName.JAVA_SPRING]: "0.4.9-1-ge0997b3",
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
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V24.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip"
        }),
    migrateBackwards: (v25, context): IrVersions.V24.ir.IntermediateRepresentation => {
        const bytesEndpoints: IrVersions.V25.HttpEndpoint[] = [];
        const textHttpEndpoints: IrVersions.V25.HttpEndpoint[] = [];
        const v24CompatibleServices: Record<IrVersions.V24.ServiceId, IrVersions.V24.HttpService> = {};
        for (const [serviceId, httpService] of Object.entries(v25.services)) {
            const v24CompatibleEndpoints: IrVersions.V24.HttpEndpoint[] = [];
            for (const endpoint of httpService.endpoints) {
                let v24SdkRequest: IrVersions.V24.SdkRequest | undefined = undefined;
                if (endpoint.sdkRequest != null) {
                    v24SdkRequest = getV24SDKRequest(endpoint.sdkRequest);
                    if (v24SdkRequest == null) {
                        bytesEndpoints.push(endpoint);
                        continue;
                    }
                }

                if (endpoint.response != null) {
                    const v24Response = endpoint.response._visit<IrVersions.V24.HttpResponse>({
                        fileDownload: (fileDownload) => IrVersions.V24.HttpResponse.fileDownload(fileDownload),
                        json: (json) => IrVersions.V24.HttpResponse.json(json),
                        streaming: (streaming) => IrVersions.V24.HttpResponse.streaming(streaming),
                        text: () => {
                            textHttpEndpoints.push(endpoint);
                            return IrVersions.V24.HttpResponse.json({
                                docs: undefined,
                                responseBodyType: IrVersions.V24.TypeReference.unknown()
                            });
                        },
                        _other: () => {
                            throw new Error("Encountered unknown response type");
                        }
                    });
                    v24CompatibleEndpoints.push({
                        ...endpoint,
                        sdkRequest: v24SdkRequest,
                        response: v24Response
                    });
                } else {
                    v24CompatibleEndpoints.push({
                        ...endpoint,
                        sdkRequest: v24SdkRequest,
                        response: undefined
                    });
                }
            }
            v24CompatibleServices[serviceId] = {
                ...httpService,
                endpoints: v24CompatibleEndpoints
            };
        }
        if (textHttpEndpoints.length > 0) {
            context.taskContext.logger.warn(
                `Generator ${context.targetGenerator?.name}@${context.targetGenerator?.version}` +
                    " does not support text/plain responses. "
            );
            if (textHttpEndpoints.length === 1 && textHttpEndpoints[0] != null) {
                context.taskContext.logger.warn(
                    `Therefore, endpoint ${textHttpEndpoints[0].name.originalName} response type will be casted to unkown.`
                );
            } else {
                context.taskContext.logger.warn(
                    `Therefore, endpoints ${textHttpEndpoints
                        .map((endpoint) => endpoint.name.originalName)
                        .join(", ")} response types will be casted to unkown.`
                );
            }
        }
        if (bytesEndpoints.length > 0) {
            context.taskContext.logger.warn(
                `Generator ${context.targetGenerator?.name}@${context.targetGenerator?.version}` +
                    " does not support bytes requests. "
            );
            if (bytesEndpoints.length === 1 && bytesEndpoints[0] != null) {
                context.taskContext.logger.warn(
                    `Therefore, endpoint ${bytesEndpoints[0].name.originalName} will be skipped.`
                );
            } else {
                context.taskContext.logger.warn(
                    `Therefore, endpoints ${bytesEndpoints
                        .map((endpoint) => endpoint.name.originalName)
                        .join(", ")} will be skipped.`
                );
            }
        }
        return {
            ...v25,
            services: v24CompatibleServices
        };
    }
};

function getV24SDKRequest(sdkRequest: IrVersions.V25.SdkRequest): IrVersions.V24.SdkRequest | undefined {
    const shape = sdkRequest.shape;
    if (shape.type === "wrapper") {
        return {
            shape: IrVersions.V24.SdkRequestShape.wrapper({
                ...shape
            }),
            requestParameterName: sdkRequest.requestParameterName
        };
    }
    if (shape.value.type === "typeReference") {
        return {
            shape: IrVersions.V24.SdkRequestShape.justRequestBody({
                ...shape.value
            }),
            requestParameterName: sdkRequest.requestParameterName
        };
    }
    return undefined;
}
