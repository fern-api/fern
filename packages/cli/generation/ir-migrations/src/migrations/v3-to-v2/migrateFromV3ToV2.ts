import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";
import { getReferencedTypesForInlinedRequest } from "./getReferencedTypesForInlinedRequest";

export const V3_TO_V2_MIGRATION: IrMigration<
    IrVersions.V3.ir.IntermediateRepresentation,
    IrVersions.V2.ir.IntermediateRepresentation
> = {
    laterVersion: "v3",
    earlierVersion: "v2",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.249",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.0.134-3-g97d4964",
        [GeneratorName.JAVA_SDK]: "0.0.134-3-g97d4964",
        [GeneratorName.JAVA_SPRING]: "0.0.134-3-g97d4964",
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
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
    migrateBackwards: (v3): IrVersions.V2.ir.IntermediateRepresentation => {
        const newTypes = [...v3.types];

        return {
            apiName: v3.apiName,
            auth: v3.auth,
            headers: v3.headers,
            types: newTypes,
            errors: v3.errors,
            constants: v3.constants,
            constantsV2: v3.constantsV2,
            defaultEnvironment: v3.defaultEnvironment,
            environments: v3.environments,
            errorDiscriminant: v3.errorDiscriminant,
            errorDiscriminationStrategy: v3.errorDiscriminationStrategy,
            sdkConfig: v3.sdkConfig,
            services: {
                websocket: v3.services.websocket,
                http: v3.services.http.map((httpService) => ({
                    availability: httpService.availability,
                    docs: httpService.docs,
                    name: httpService.name,
                    basePath: httpService.basePath,
                    basePathV2: httpService.basePathV2,
                    headers: httpService.headers,
                    pathParameters: httpService.pathParameters,
                    endpoints: httpService.endpoints.map((endpoint) =>
                        migrateEndpoint(httpService, endpoint, v3.types, (type) => {
                            newTypes.push(type);
                        })
                    )
                }))
            }
        };
    }
};

function migrateEndpoint(
    v3Service: IrVersions.V3.services.http.HttpService,
    v3Endpoint: IrVersions.V3.services.http.HttpEndpoint,
    allTypes: IrVersions.V2.types.TypeDeclaration[],
    addType: (newType: IrVersions.V2.types.TypeDeclaration) => void
): IrVersions.V2.services.http.HttpEndpoint {
    return {
        docs: v3Endpoint.docs,
        availability: v3Endpoint.availability,
        id: v3Endpoint.id,
        name: v3Endpoint.name,
        nameV2: v3Endpoint.nameV2,
        method: v3Endpoint.method,
        headers: v3Endpoint.headers,
        path: v3Endpoint.path,
        pathParameters: v3Endpoint.pathParameters,
        queryParameters: v3Endpoint.queryParameters,
        request: migrateRequest(v3Endpoint, v3Service, allTypes, addType),
        response: v3Endpoint.response,
        errors: v3Endpoint.errors,
        errorsV2: v3Endpoint.errorsV2,
        auth: v3Endpoint.auth
    };
}

function migrateRequest(
    v3Endpoint: IrVersions.V3.services.http.HttpEndpoint,
    v3Service: IrVersions.V3.services.http.HttpService,
    allTypes: IrVersions.V2.types.TypeDeclaration[],
    addType: (newType: IrVersions.V2.types.TypeDeclaration) => void
): IrVersions.V2.services.http.HttpRequest {
    const v3Request = v3Endpoint.requestBody;

    if (v3Request == null) {
        return {
            docs: undefined,
            type: IrVersions.V2.types.TypeReference.void(),
            typeV2: undefined
        };
    }
    return IrVersions.V3.services.http.HttpRequestBody._visit<IrVersions.V2.services.http.HttpRequest>(v3Request, {
        reference: (reference) => ({
            docs: reference.docs,
            type: reference.requestBodyType,
            typeV2: reference.requestBodyType
        }),
        inlinedRequestBody: (inlinedRequestBody) => {
            const typeName: IrVersions.V2.types.DeclaredTypeName = {
                fernFilepath: v3Service.name.fernFilepath,
                fernFilepathV2: v3Service.name.fernFilepathV2,
                name: inlinedRequestBody.name.unsafeName.originalValue,
                nameV2: {
                    originalValue: inlinedRequestBody.name.unsafeName.originalValue,
                    camelCase: inlinedRequestBody.name.unsafeName.camelCase,
                    pascalCase: inlinedRequestBody.name.unsafeName.pascalCase,
                    snakeCase: inlinedRequestBody.name.unsafeName.snakeCase,
                    screamingSnakeCase: inlinedRequestBody.name.unsafeName.screamingSnakeCase
                },
                nameV3: inlinedRequestBody.name
            };

            const shape = IrVersions.V2.types.Type.object({
                extends: inlinedRequestBody.extends,
                properties: inlinedRequestBody.properties.map(
                    (property): IrVersions.V2.types.ObjectProperty => ({
                        availability: v3Endpoint.availability,
                        docs: property.docs,
                        name: {
                            originalValue: property.name.name.unsafeName.originalValue,
                            camelCase: property.name.name.unsafeName.camelCase,
                            pascalCase: property.name.name.unsafeName.pascalCase,
                            snakeCase: property.name.name.unsafeName.snakeCase,
                            screamingSnakeCase: property.name.name.unsafeName.screamingSnakeCase,
                            wireValue: property.name.wireValue
                        },
                        nameV2: property.name,
                        valueType: property.valueType
                    })
                )
            });

            addType({
                docs: undefined,
                availability: v3Endpoint.availability,
                name: typeName,
                shape,
                referencedTypes: getReferencedTypesForInlinedRequest({ inlinedRequest: inlinedRequestBody, allTypes }),
                examples: []
            });

            const typeReference = IrVersions.V2.types.TypeReference.named(typeName);

            return {
                docs: undefined,
                type: typeReference,
                typeV2: typeReference
            };
        },
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody type: " + v3Request.type);
        }
    });
}
