import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V31_TO_V30_MIGRATION: IrMigration<
    IrVersions.V31.ir.IntermediateRepresentation,
    IrVersions.V30.ir.IntermediateRepresentation
> = {
    laterVersion: "v31",
    earlierVersion: "v30",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.8.8",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.8.8",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.8.8",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.7.0-rc0",
        [GeneratorName.JAVA_SDK]: "0.7.0-rc0",
        [GeneratorName.JAVA_SPRING]: "0.7.0-rc0",
        [GeneratorName.PYTHON_FASTAPI]: "0.7.5-1-gb54fb677",
        [GeneratorName.PYTHON_PYDANTIC]: "0.7.5-1-gb54fb677",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.7.5-1-gb54fb677",
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
        IrSerialization.V30.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v31): IrVersions.V30.ir.IntermediateRepresentation => {
        return {
            apiName: v31.apiName,
            apiDisplayName: v31.apiDisplayName,
            apiDocs: v31.apiDocs,
            auth: v31.auth,
            headers: v31.headers,
            types: v31.types,
            webhookGroups: v31.webhookGroups,
            errors: v31.errors,
            subpackages: v31.subpackages,
            rootPackage: v31.rootPackage,
            constants: v31.constants,
            environments: v31.environments,
            basePath: v31.basePath,
            pathParameters: v31.pathParameters,
            errorDiscriminationStrategy: v31.errorDiscriminationStrategy,
            sdkConfig: v31.sdkConfig,
            variables: v31.variables,
            serviceTypeReferenceInfo: v31.serviceTypeReferenceInfo,
            services: Object.fromEntries(
                Object.entries(v31.services).map(([id, service]) => {
                    return [
                        id,
                        {
                            availability: service.availability,
                            name: service.name,
                            displayName: service.displayName,
                            basePath: service.basePath,
                            endpoints: service.endpoints.map((endpoint) => {
                                return {
                                    id: endpoint.id,
                                    docs: endpoint.docs,
                                    availability: endpoint.availability,
                                    name: endpoint.name,
                                    displayName: endpoint.displayName,
                                    method: endpoint.method,
                                    headers: endpoint.headers,
                                    baseUrl: endpoint.baseUrl,
                                    path: endpoint.path,
                                    fullPath: endpoint.fullPath,
                                    pathParameters: endpoint.pathParameters,
                                    allPathParameters: endpoint.allPathParameters,
                                    queryParameters: endpoint.queryParameters,
                                    requestBody: endpoint.requestBody,
                                    sdkRequest: endpoint.sdkRequest,
                                    response: endpoint.response,
                                    errors: endpoint.errors,
                                    auth: endpoint.auth,
                                    examples: endpoint.examples
                                };
                            }),
                            headers: service.headers,
                            pathParameters: service.pathParameters
                        }
                    ];
                })
            )
        };
    }
};
