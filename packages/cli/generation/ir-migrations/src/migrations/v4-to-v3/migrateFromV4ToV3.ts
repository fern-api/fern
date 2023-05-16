import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V4_TO_V3_MIGRATION: IrMigration<
    IrVersions.V4.ir.IntermediateRepresentation,
    IrVersions.V3.ir.IntermediateRepresentation
> = {
    laterVersion: "v4",
    earlierVersion: "v3",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: "0.0.11-4-g1c29f6c",
        [GeneratorName.POSTMAN]: "0.0.32-rc0",
        [GeneratorName.STOPLIGHT]: undefined,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: undefined,
        [GeneratorName.GO_MODEL]: AlwaysRunMigration,
    },
    migrateBackwards: (v4): IrVersions.V3.ir.IntermediateRepresentation => {
        return {
            apiName: v4.apiName,
            auth: v4.auth,
            headers: v4.headers,
            types: v4.types.map(
                (v4Type): IrVersions.V3.types.TypeDeclaration => ({
                    docs: v4Type.docs,
                    availability: v4Type.availability,
                    name: v4Type.name,
                    shape: v4Type.shape,
                    examples: v4Type.examples.map(
                        (v4Example): IrVersions.V3.types.ExampleType => convertExampleType(v4Example.shape)
                    ),
                    referencedTypes: v4Type.referencedTypes,
                })
            ),
            errors: v4.errors,
            constants: v4.constants,
            constantsV2: v4.constantsV2,
            defaultEnvironment: v4.defaultEnvironment,
            environments: v4.environments,
            errorDiscriminant: v4.errorDiscriminant,
            errorDiscriminationStrategy: v4.errorDiscriminationStrategy,
            sdkConfig: v4.sdkConfig,
            services: {
                ...v4.services,
                http: v4.services.http.map((service) => ({
                    ...service,
                    endpoints: service.endpoints.map((endpoint) => ({
                        ...endpoint,
                        examples: endpoint.examples.map((example) => convertExampleEndpointCall(example)),
                    })),
                })),
            },
        };
    },
};

function convertExampleType(v4Example: IrVersions.V4.types.ExampleTypeShape): IrVersions.V3.types.ExampleType {
    return IrVersions.V4.types.ExampleTypeShape._visit<IrVersions.V3.types.ExampleType>(v4Example, {
        object: (exampleObject) => IrVersions.V3.types.ExampleType.object(convertExampleObject(exampleObject)),
        union: (exampleUnion) => IrVersions.V3.types.ExampleType.union(convertExampleUnion(exampleUnion)),
        alias: (exampleAlias) => IrVersions.V3.types.ExampleType.alias(convertExampleAlias(exampleAlias)),
        enum: IrVersions.V3.types.ExampleType.enum,
        _unknown: () => {
            throw new Error("Unknown ExampleTypeShape: " + v4Example.type);
        },
    });
}

function convertExampleObject(v4Example: IrVersions.V4.types.ExampleObjectType): IrVersions.V3.types.ExampleObjectType {
    return {
        properties: v4Example.properties.map(
            (property): IrVersions.V3.types.ExampleObjectProperty => ({
                wireKey: property.wireKey,
                value: convertExampleTypeReference(property.value),
                originalTypeDeclaration: property.originalTypeDeclaration,
            })
        ),
    };
}

function convertExampleTypeReference(
    v4Example: IrVersions.V4.types.ExampleTypeReference
): IrVersions.V3.types.ExampleTypeReference {
    return IrVersions.V4.types.ExampleTypeReferenceShape._visit<IrVersions.V3.types.ExampleTypeReference>(
        v4Example.shape,
        {
            primitive: IrVersions.V3.types.ExampleTypeReference.primitive,
            container: (containerExample) =>
                IrVersions.V3.types.ExampleTypeReference.container(convertContainerExample(containerExample)),
            named: (namedExample) => IrVersions.V3.types.ExampleTypeReference.named(convertNamedExample(namedExample)),
            unknown: IrVersions.V3.types.ExampleTypeReference.unknown,
            _unknown: () => {
                throw new Error("Unknown ExampleTypeReference: " + v4Example.shape.type);
            },
        }
    );
}

function convertContainerExample(
    v4Example: IrVersions.V4.types.ExampleContainer
): IrVersions.V3.types.ExampleContainer {
    return IrVersions.V4.types.ExampleContainer._visit<IrVersions.V3.types.ExampleContainer>(v4Example, {
        list: (exampleItems) =>
            IrVersions.V3.types.ExampleContainer.list(exampleItems.map(convertExampleTypeReference)),
        set: (exampleItems) => IrVersions.V3.types.ExampleContainer.set(exampleItems.map(convertExampleTypeReference)),
        optional: (exampleItem) =>
            IrVersions.V3.types.ExampleContainer.optional(
                exampleItem != null ? convertExampleTypeReference(exampleItem) : undefined
            ),
        map: (examplePairs) =>
            IrVersions.V3.types.ExampleContainer.map(
                examplePairs.map((pair) => ({
                    key: convertExampleTypeReference(pair.key),
                    value: convertExampleTypeReference(pair.value),
                }))
            ),
        _unknown: () => {
            throw new Error("Unknown ExampleContainer: " + v4Example.type);
        },
    });
}

function convertNamedExample(v4Example: IrVersions.V4.types.ExampleNamedType): IrVersions.V3.types.ExampleNamedType {
    return {
        typeName: v4Example.typeName,
        shape: convertExampleType(v4Example.shape),
    };
}

function convertExampleUnion(
    v4Example: IrVersions.V4.types.ExampleSingleUnionType
): IrVersions.V3.types.ExampleSingleUnionType {
    return {
        wireDiscriminantValue: v4Example.wireDiscriminantValue,
        properties:
            IrVersions.V4.types.ExampleSingleUnionTypeProperties._visit<IrVersions.V3.types.ExampleSingleUnionTypeProperties>(
                v4Example.properties,
                {
                    samePropertiesAsObject: (namedExample) =>
                        IrVersions.V3.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject(
                            convertNamedExample(namedExample)
                        ),
                    singleProperty: (propertyExample) =>
                        IrVersions.V3.types.ExampleSingleUnionTypeProperties.singleProperty(
                            convertExampleTypeReference(propertyExample)
                        ),
                    noProperties: () => IrVersions.V3.types.ExampleSingleUnionTypeProperties.noProperties(),
                    _unknown: () => {
                        throw new Error("Unknown ExampleSingleUnionTypeProperties: " + v4Example.properties.type);
                    },
                }
            ),
    };
}

function convertExampleAlias(v4Example: IrVersions.V4.types.ExampleAliasType): IrVersions.V3.types.ExampleAliasType {
    return {
        value: convertExampleTypeReference(v4Example.value),
    };
}

function convertExampleEndpointCall(
    example: IrVersions.V4.services.http.ExampleEndpointCall
): IrVersions.V3.services.http.ExampleEndpointCall {
    return {
        servicePathParameters: example.servicePathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        endpointPathParameters: example.servicePathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        serviceHeaders: example.serviceHeaders.map((header) => convertExampleHeader(header)),
        endpointHeaders: example.endpointHeaders.map((header) => convertExampleHeader(header)),
        queryParameters: example.queryParameters.map((queryParameter) => convertExampleQueryParameter(queryParameter)),
        request: example.request != null ? convertExampleRequest(example.request) : undefined,
        response: convertExampleResponse(example.response),
    };
}

function convertExamplePathParameter(
    pathParameter: IrVersions.V4.services.http.ExamplePathParameter
): IrVersions.V3.services.http.ExamplePathParameter {
    return {
        key: pathParameter.key,
        value: convertExampleTypeReference(pathParameter.value),
    };
}

function convertExampleHeader(
    header: IrVersions.V4.services.http.ExampleHeader
): IrVersions.V3.services.http.ExampleHeader {
    return {
        key: header.wireKey,
        value: convertExampleTypeReference(header.value),
    };
}

function convertExampleQueryParameter(
    queryParameter: IrVersions.V4.services.http.ExampleQueryParameter
): IrVersions.V3.services.http.ExampleQueryParameter {
    return {
        key: queryParameter.wireKey,
        value: convertExampleTypeReference(queryParameter.value),
    };
}

function convertExampleRequest(
    request: IrVersions.V4.services.http.ExampleRequestBody
): IrVersions.V3.services.http.ExampleRequestBody {
    return IrVersions.V4.services.http.ExampleRequestBody._visit<IrVersions.V3.services.http.ExampleRequestBody>(
        request,
        {
            inlinedRequestBody: (inlinedRequestBody) =>
                IrVersions.V3.services.http.ExampleRequestBody.inlinedRequestBody({
                    properties: inlinedRequestBody.properties.map((property) =>
                        convertExampleInlinedRequestBodyProperty(property)
                    ),
                }),
            reference: (reference) =>
                IrVersions.V3.services.http.ExampleRequestBody.reference(convertExampleTypeReference(reference)),
            _unknown: () => {
                throw new Error("Unknown ExampleRequestBody: " + request.type);
            },
        }
    );
}

function convertExampleInlinedRequestBodyProperty(
    property: IrVersions.V4.services.http.ExampleInlinedRequestBodyProperty
): IrVersions.V3.services.http.ExampleInlinedRequestBodyProperty {
    return {
        wireKey: property.wireKey,
        value: convertExampleTypeReference(property.value),
        originalTypeDeclaration: property.originalTypeDeclaration,
    };
}

function convertExampleResponse(
    response: IrVersions.V4.services.http.ExampleResponse
): IrVersions.V3.services.http.ExampleResponse {
    return IrVersions.V4.services.http.ExampleResponse._visit<IrVersions.V3.services.http.ExampleResponse>(response, {
        ok: (okResponse) =>
            IrVersions.V3.services.http.ExampleResponse.ok({
                body: okResponse.body != null ? convertExampleTypeReference(okResponse.body) : undefined,
            }),
        error: (errorResponse) =>
            IrVersions.V3.services.http.ExampleResponse.error({
                error: errorResponse.error,
                body: errorResponse.body != null ? convertExampleTypeReference(errorResponse.body) : undefined,
            }),
        _unknown: () => {
            throw new Error("Unknown ExampleResponse: " + response.type);
        },
    });
}
