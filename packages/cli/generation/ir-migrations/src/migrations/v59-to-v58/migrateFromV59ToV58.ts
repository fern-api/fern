import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V59_TO_V58_MIGRATION: IrMigration<
    IrVersions.V59.ir.IntermediateRepresentation,
    IrVersions.V58.ir.IntermediateRepresentation
> = {
    laterVersion: "v59",
    earlierVersion: "v58",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V58.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v59): IrVersions.V58.ir.IntermediateRepresentation => {
        return {
            ...v59,
            services: v59.services != null ? convertServicesIr(v59.services) : undefined
        } as IrVersions.V58.ir.IntermediateRepresentation;
    }
};

function convertServicesIr(
    services: Record<string, IrVersions.V59.http.HttpService>
): Record<string, IrVersions.V58.http.HttpService> {
    return Object.fromEntries(Object.entries(services).map(([key, service]) => [key, convertServiceIr(service)]));
}

function convertServiceIr(service: IrVersions.V59.http.HttpService): IrVersions.V58.http.HttpService {
    return {
        ...service,
        endpoints: convertEndpointsIr(service.endpoints)
    };
}

function convertEndpointsIr(endpoints: IrVersions.V59.http.HttpEndpoint[]): IrVersions.V58.http.HttpEndpoint[] {
    return endpoints.map(convertEndpointIr);
}

function convertEndpointIr(endpoint: IrVersions.V59.http.HttpEndpoint): IrVersions.V58.http.HttpEndpoint | undefined {
    switch (endpoint.requestBody?.type) {
        case "fileUpload": {
            const newEndpoint: IrVersions.V58.http.HttpEndpoint = {
                ...endpoint,
                requestBody: {
                    ...endpoint.requestBody,
                    properties: endpoint.requestBody.properties.map((property) => {
                        if (property.type !== "bodyProperty") {
                            return property;
                        }
                        // remove explodeParts from FileUploadBodyProperty
                        const { explodeParts, ...newProperty } = property;
                        return newProperty;
                    })
                }
            };
            return newEndpoint;
        }
        default:
            return endpoint;
    }
}
