import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V8_TO_V7_MIGRATION: IrMigration<
    IrVersions.V8.ir.IntermediateRepresentation,
    IrVersions.V7.ir.IntermediateRepresentation
> = {
    laterVersion: "v8",
    earlierVersion: "v7",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.273-5-g1b00245b",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.273-5-g1b00245b",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.0.45-1-g8bb600f",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.45-1-g8bb600f",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: "0.0.0",
        [GeneratorName.OPENAPI]: "0.0.20-1-gbbeb9bd",
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
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
    migrateBackwards: (v8): IrVersions.V7.ir.IntermediateRepresentation => {
        return {
            ...v8,
            auth: convertAuth(v8.auth),
            headers: v8.headers.map((header) => convertHeader(header)),
            types: v8.types.map((type) => convertTypeDeclaration(type)),
            errors: v8.errors.map((error) => convertErrorDeclaration(error)),
            services: v8.services.map((service) => convertHttpService(service))
        };
    }
};

function convertFernFilepath(fernFilepath: IrVersions.V8.commons.FernFilepath): IrVersions.V7.commons.FernFilepath {
    return fernFilepath.allParts;
}

function convertAuth(auth: IrVersions.V8.auth.ApiAuth): IrVersions.V7.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => {
            if (scheme._type !== "header") {
                return scheme;
            }
            return IrVersions.V7.auth.AuthScheme.header(convertHeader(scheme));
        })
    };
}

function convertHeader(header: IrVersions.V8.http.HttpHeader): IrVersions.V7.http.HttpHeader {
    return {
        docs: header.docs,
        availability: header.availability,
        name: header.name,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertTypeReference(typeReference: IrVersions.V8.types.TypeReference): IrVersions.V7.types.TypeReference {
    return IrVersions.V8.types.TypeReference._visit<IrVersions.V7.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V7.types.TypeReference.container(convertContainerType(container)),
        named: (declaredTypeName) => IrVersions.V7.types.TypeReference.named(convertDeclaredTypeName(declaredTypeName)),
        primitive: IrVersions.V7.types.TypeReference.primitive,
        unknown: IrVersions.V7.types.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown type reference: " + typeReference._type);
        }
    });
}

function convertContainerType(container: IrVersions.V8.types.ContainerType): IrVersions.V7.types.ContainerType {
    return IrVersions.V8.types.ContainerType._visit<IrVersions.V7.types.ContainerType>(container, {
        list: (itemType) => IrVersions.V7.types.ContainerType.list(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V7.types.ContainerType.optional(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V7.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V7.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        literal: IrVersions.V7.types.ContainerType.literal,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        }
    });
}

function convertDeclaredTypeName(typeName: IrVersions.V8.types.DeclaredTypeName): IrVersions.V7.types.DeclaredTypeName {
    return {
        name: typeName.name,
        fernFilepath: convertFernFilepath(typeName.fernFilepath)
    };
}

function convertTypeDeclaration(type: IrVersions.V8.types.TypeDeclaration): IrVersions.V7.types.TypeDeclaration {
    return {
        docs: type.docs,
        availability: type.availability,
        name: convertDeclaredTypeName(type.name),
        shape: convertTypeShape(type.shape),
        examples: type.examples.map((example) => convertExampleType(example)),
        referencedTypes: type.referencedTypes.map((referencedType) => convertDeclaredTypeName(referencedType))
    };
}

function convertTypeShape(shape: IrVersions.V8.types.Type): IrVersions.V7.types.Type {
    return IrVersions.V8.types.Type._visit<IrVersions.V7.types.Type>(shape, {
        alias: (alias) =>
            IrVersions.V7.types.Type.alias({
                aliasOf: convertTypeReference(alias.aliasOf),
                resolvedType: convertResolvedType(alias.resolvedType)
            }),
        enum: IrVersions.V7.types.Type.enum,
        object: (object) =>
            IrVersions.V7.types.Type.object({
                extends: object.extends.map((extension) => convertDeclaredTypeName(extension)),
                properties: object.properties.map((property) => ({
                    docs: property.docs,
                    availability: property.availability,
                    name: property.name,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        union: (union) =>
            IrVersions.V7.types.Type.union({
                discriminant: union.discriminant,
                types: union.types.map((singleUnionType) => convertSingleUnionType(singleUnionType))
            }),
        _unknown: () => {
            throw new Error("Unknown Type shape: " + shape._type);
        }
    });
}

function convertResolvedType(
    resolvedType: IrVersions.V8.types.ResolvedTypeReference
): IrVersions.V7.types.ResolvedTypeReference {
    return IrVersions.V8.types.ResolvedTypeReference._visit<IrVersions.V7.types.ResolvedTypeReference>(resolvedType, {
        container: (container) => IrVersions.V7.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: (named) =>
            IrVersions.V7.types.ResolvedTypeReference.named({
                name: convertDeclaredTypeName(named.name),
                shape: named.shape
            }),
        primitive: IrVersions.V7.types.ResolvedTypeReference.primitive,
        unknown: IrVersions.V7.types.ResolvedTypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown ResolvedTypeReference: " + resolvedType._type);
        }
    });
}

function convertSingleUnionType(
    singleUnionType: IrVersions.V8.types.SingleUnionType
): IrVersions.V7.types.SingleUnionType {
    return {
        docs: singleUnionType.docs,
        discriminantValue: singleUnionType.discriminantValue,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V8.types.SingleUnionTypeProperties
): IrVersions.V7.types.SingleUnionTypeProperties {
    return IrVersions.V8.types.SingleUnionTypeProperties._visit<IrVersions.V7.types.SingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (name) =>
                IrVersions.V7.types.SingleUnionTypeProperties.samePropertiesAsObject(convertDeclaredTypeName(name)),
            singleProperty: (singleProperty) =>
                IrVersions.V7.types.SingleUnionTypeProperties.singleProperty({
                    name: singleProperty.name,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V7.types.SingleUnionTypeProperties.noProperties,
            _unknown: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + properties._type);
            }
        }
    );
}

function convertExampleType(example: IrVersions.V8.types.ExampleType): IrVersions.V7.types.ExampleType {
    return {
        jsonExample: example.jsonExample,
        docs: example.docs,
        name: example.name,
        shape: convertExampleTypeShape(example.shape)
    };
}

function convertExampleTypeShape(example: IrVersions.V8.types.ExampleTypeShape): IrVersions.V7.types.ExampleTypeShape {
    return IrVersions.V8.types.ExampleTypeShape._visit<IrVersions.V7.types.ExampleTypeShape>(example, {
        alias: (alias) =>
            IrVersions.V7.types.ExampleTypeShape.alias({
                value: convertExampleTypeReference(alias.value)
            }),
        enum: IrVersions.V7.types.ExampleTypeShape.enum,
        object: (object) =>
            IrVersions.V7.types.ExampleTypeShape.object({
                properties: object.properties.map((property) => ({
                    wireKey: property.wireKey,
                    value: convertExampleTypeReference(property.value),
                    originalTypeDeclaration: convertDeclaredTypeName(property.originalTypeDeclaration)
                }))
            }),
        union: (union) =>
            IrVersions.V7.types.ExampleTypeShape.union({
                wireDiscriminantValue: union.wireDiscriminantValue,
                properties: convertExampleSingleUnionTypeProperties(union.properties)
            }),
        _unknown: () => {
            throw new Error("Unkonwn ExampleTypeShape: " + example.type);
        }
    });
}

function convertExampleTypeReference(
    example: IrVersions.V8.types.ExampleTypeReference
): IrVersions.V7.types.ExampleTypeReference {
    return {
        jsonExample: example.jsonExample,
        shape: convertExampleTypeReferenceShape(example.shape)
    };
}

function convertExampleTypeReferenceShape(
    example: IrVersions.V8.types.ExampleTypeReferenceShape
): IrVersions.V7.types.ExampleTypeReferenceShape {
    return IrVersions.V8.types.ExampleTypeReferenceShape._visit<IrVersions.V7.types.ExampleTypeReferenceShape>(
        example,
        {
            named: (named) =>
                IrVersions.V7.types.ExampleTypeReferenceShape.named({
                    typeName: convertDeclaredTypeName(named.typeName),
                    shape: convertExampleTypeShape(named.shape)
                }),
            container: (container) =>
                IrVersions.V7.types.ExampleTypeReferenceShape.container(
                    IrVersions.V8.types.ExampleContainer._visit<IrVersions.V7.types.ExampleContainer>(container, {
                        list: (items) =>
                            IrVersions.V7.types.ExampleContainer.list(
                                items.map((item) => convertExampleTypeReference(item))
                            ),
                        set: (items) =>
                            IrVersions.V7.types.ExampleContainer.set(
                                items.map((item) => convertExampleTypeReference(item))
                            ),
                        optional: (item) =>
                            IrVersions.V7.types.ExampleContainer.optional(
                                item != null ? convertExampleTypeReference(item) : undefined
                            ),
                        map: (pairs) =>
                            IrVersions.V7.types.ExampleContainer.map(
                                pairs.map((pair) => ({
                                    key: convertExampleTypeReference(pair.key),
                                    value: convertExampleTypeReference(pair.value)
                                }))
                            ),
                        _unknown: () => {
                            throw new Error("Unknown ExampleContainer: " + container.type);
                        }
                    })
                ),
            primitive: IrVersions.V7.types.ExampleTypeReferenceShape.primitive,
            unknown: IrVersions.V7.types.ExampleTypeReferenceShape.unknown,
            _unknown: () => {
                throw new Error("Unknown ExampleTypeReferenceShape: " + example.type);
            }
        }
    );
}

function convertExampleSingleUnionTypeProperties(
    properties: IrVersions.V8.types.ExampleSingleUnionTypeProperties
): IrVersions.V7.types.ExampleSingleUnionTypeProperties {
    return IrVersions.V8.types.ExampleSingleUnionTypeProperties._visit<IrVersions.V7.types.ExampleSingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (exampleNamedType) =>
                IrVersions.V7.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                    typeName: convertDeclaredTypeName(exampleNamedType.typeName),
                    shape: convertExampleTypeShape(exampleNamedType.shape)
                }),
            singleProperty: (property) =>
                IrVersions.V7.types.ExampleSingleUnionTypeProperties.singleProperty({
                    jsonExample: property.jsonExample,
                    shape: convertExampleTypeReferenceShape(property.shape)
                }),
            noProperties: IrVersions.V7.types.ExampleSingleUnionTypeProperties.noProperties,
            _unknown: () => {
                throw new Error("Unknown ExampleSingleUnionTypeProperties: " + properties.type);
            }
        }
    );
}

function convertErrorDeclaration(error: IrVersions.V8.errors.ErrorDeclaration): IrVersions.V7.errors.ErrorDeclaration {
    return {
        docs: error.docs,
        name: convertDeclaredErrorName(error.name),
        discriminantValue: error.discriminantValue,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        statusCode: error.statusCode
    };
}

function convertDeclaredErrorName(
    name: IrVersions.V8.errors.DeclaredErrorName
): IrVersions.V7.errors.DeclaredErrorName {
    return {
        name: name.name,
        fernFilepath: convertFernFilepath(name.fernFilepath)
    };
}

function convertHttpService(service: IrVersions.V8.http.HttpService): IrVersions.V7.http.HttpService {
    return {
        docs: service.docs,
        availability: service.availability,
        name: {
            fernFilepath: convertFernFilepath(service.name.fernFilepath)
        },
        displayName: service.displayName,
        basePath: service.basePath,
        baseUrl: service.baseUrl,
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        headers: service.headers.map((header) => convertHeader(header)),
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertPathParameter(pathParameter: IrVersions.V8.http.PathParameter): IrVersions.V7.http.PathParameter {
    return {
        availability: pathParameter.availability,
        docs: pathParameter.docs,
        name: pathParameter.name,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertEndpoint(endpoint: IrVersions.V8.http.HttpEndpoint): IrVersions.V7.http.HttpEndpoint {
    return {
        docs: endpoint.docs,
        availability: endpoint.availability,
        name: endpoint.name,
        displayName: endpoint.displayName,
        errors: endpoint.errors.map((error) => convertResponseError(error)),
        auth: endpoint.auth,
        method: endpoint.method,
        path: endpoint.path,
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        sdkRequest: endpoint.sdkRequest != null ? convertSdkRequest(endpoint.sdkRequest) : undefined,
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        response: convertHttpResponse(endpoint.response),
        headers: endpoint.headers.map((header) => convertHeader(header)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter)),
        examples: endpoint.examples.map((example) => convertExampleEndpointCall(example))
    };
}

function convertResponseError(error: IrVersions.V8.http.ResponseError): IrVersions.V7.http.ResponseError {
    return {
        docs: error.docs,
        error: convertDeclaredErrorName(error.error)
    };
}

function convertQueryParameter(queryParameter: IrVersions.V8.http.QueryParameter): IrVersions.V7.http.QueryParameter {
    return {
        availability: queryParameter.availability,
        docs: queryParameter.docs,
        name: queryParameter.name,
        valueType: convertTypeReference(queryParameter.valueType),
        allowMultiple: queryParameter.allowMultiple
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V8.http.SdkRequest): IrVersions.V7.http.SdkRequest {
    return {
        requestParameterName: sdkRequest.requestParameterName,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V8.http.SdkRequestShape): IrVersions.V7.http.SdkRequestShape {
    return IrVersions.V8.http.SdkRequestShape._visit<IrVersions.V7.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V7.http.SdkRequestShape.justRequestBody({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        wrapper: IrVersions.V7.http.SdkRequestShape.wrapper,
        _unknown: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertRequestBody(requestBody: IrVersions.V8.http.HttpRequestBody): IrVersions.V7.http.HttpRequestBody {
    return IrVersions.V8.http.HttpRequestBody._visit<IrVersions.V7.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V7.http.HttpRequestBody.inlinedRequestBody({
                name: inlinedRequestBody.name,
                extends: inlinedRequestBody.extends.map((typeName) => convertDeclaredTypeName(typeName)),
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs,
                    name: property.name,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V7.http.HttpRequestBody.reference({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + requestBody.type);
        }
    });
}

function convertHttpResponse(response: IrVersions.V8.http.HttpResponse): IrVersions.V7.http.HttpResponse {
    return {
        docs: response.docs,
        type: response.type != null ? convertTypeReference(response.type) : undefined
    };
}

function convertExampleEndpointCall(
    example: IrVersions.V8.http.ExampleEndpointCall
): IrVersions.V7.http.ExampleEndpointCall {
    return {
        name: example.name,
        docs: example.docs,
        servicePathParameters: example.servicePathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        endpointPathParameters: example.endpointPathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        queryParameters: example.queryParameters.map((queryParameter) => convertExampleQueryParameter(queryParameter)),
        serviceHeaders: example.serviceHeaders.map((header) => convertExampleHeader(header)),
        endpointHeaders: example.endpointHeaders.map((header) => convertExampleHeader(header)),
        request: example.request != null ? convertExampleRequest(example.request) : undefined,
        response: convertExampleResponse(example.response)
    };
}

function convertExamplePathParameter(
    example: IrVersions.V8.http.ExamplePathParameter
): IrVersions.V7.http.ExamplePathParameter {
    return {
        key: example.key,
        value: convertExampleTypeReference(example.value)
    };
}

function convertExampleQueryParameter(
    example: IrVersions.V8.http.ExampleQueryParameter
): IrVersions.V7.http.ExampleQueryParameter {
    return {
        wireKey: example.wireKey,
        value: convertExampleTypeReference(example.value)
    };
}

function convertExampleHeader(example: IrVersions.V8.http.ExampleHeader): IrVersions.V7.http.ExampleHeader {
    return {
        wireKey: example.wireKey,
        value: convertExampleTypeReference(example.value)
    };
}

function convertExampleRequest(example: IrVersions.V8.http.ExampleRequestBody): IrVersions.V7.http.ExampleRequestBody {
    return IrVersions.V8.http.ExampleRequestBody._visit<IrVersions.V7.http.ExampleRequestBody>(example, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V7.http.ExampleRequestBody.inlinedRequestBody({
                jsonExample: inlinedRequestBody.jsonExample,
                properties: inlinedRequestBody.properties.map((property) => ({
                    wireKey: property.wireKey,
                    value: convertExampleTypeReference(property.value),
                    originalTypeDeclaration:
                        property.originalTypeDeclaration != null
                            ? convertDeclaredTypeName(property.originalTypeDeclaration)
                            : undefined
                }))
            }),
        reference: (reference) =>
            IrVersions.V7.http.ExampleRequestBody.reference(convertExampleTypeReference(reference)),
        _unknown: () => {
            throw new Error("Unknown ExampleRequestBody: " + example.type);
        }
    });
}

function convertExampleResponse(example: IrVersions.V8.http.ExampleResponse): IrVersions.V7.http.ExampleResponse {
    return IrVersions.V8.http.ExampleResponse._visit<IrVersions.V7.http.ExampleResponse>(example, {
        ok: (successResponse) =>
            IrVersions.V7.http.ExampleResponse.ok({
                body: successResponse.body != null ? convertExampleTypeReference(successResponse.body) : undefined
            }),
        error: (failedResponse) =>
            IrVersions.V7.http.ExampleResponse.error({
                error: convertDeclaredErrorName(failedResponse.error),
                body: failedResponse.body != null ? convertExampleTypeReference(failedResponse.body) : undefined
            }),
        _unknown: () => {
            throw new Error("Unknown ExampleResponse: " + example.type);
        }
    });
}
