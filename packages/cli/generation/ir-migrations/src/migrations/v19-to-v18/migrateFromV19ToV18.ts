import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrMigrationContext } from "../../IrMigrationContext";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V19_TO_V18_MIGRATION: IrMigration<
    IrVersions.V19.ir.IntermediateRepresentation,
    IrVersions.V18.ir.IntermediateRepresentation
> = {
    laterVersion: "v19",
    earlierVersion: "v18",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.19-1-gef223230",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.19-1-gef223230",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.3.4-rc0-9-ge815162f",
        [GeneratorName.PYTHON_PYDANTIC]: "0.3.4-rc0-9-ge815162f",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: "0.0.44-1-gbf4b0f3",
        [GeneratorName.PYTHON_SDK]: "0.3.4-rc0-9-ge815162f",
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
    migrateBackwards: (v19, context): IrVersions.V18.ir.IntermediateRepresentation => {
        return {
            ...v19,
            services: mapValues(v19.services, (service) => {
                return convertService(service, context);
            }),
            types: mapValues(v19.types, (type) => {
                return convertTypeDeclaration(type, context);
            })
        };
    }
};

function convertService(
    service: IrVersions.V19.http.HttpService,
    context: IrMigrationContext
): IrVersions.V18.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint, context))
    };
}

function convertEndpoint(
    endpoint: IrVersions.V19.http.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V18.http.HttpEndpoint {
    return {
        ...endpoint,
        examples: endpoint.examples.map((example) => convertExampleEndpointCall(example, context))
    };
}

function convertExampleEndpointCall(
    example: IrVersions.V19.http.ExampleEndpointCall,
    context: IrMigrationContext
): IrVersions.V18.http.ExampleEndpointCall {
    return {
        docs: example.docs,
        name: example.name,
        url: example.url,
        rootPathParameters: example.rootPathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter, context)
        ),
        servicePathParameters: example.servicePathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter, context)
        ),
        endpointPathParameters: example.endpointPathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter, context)
        ),
        serviceHeaders: example.serviceHeaders.map((exampleHeader) => convertExampleHeader(exampleHeader, context)),
        endpointHeaders: example.endpointHeaders.map((exampleHeader) => convertExampleHeader(exampleHeader, context)),
        queryParameters: example.queryParameters.map((exampleQueryParameter) =>
            convertExampleQueryParameter(exampleQueryParameter, context)
        ),
        request: example.request != null ? convertExampleRequest(example.request, context) : undefined,
        response: convertExampleResponse(example.response, context)
    };
}

function convertExamplePathParameter(
    example: IrVersions.V19.http.ExamplePathParameter,
    context: IrMigrationContext
): IrVersions.V18.http.ExamplePathParameter {
    return {
        key: example.key,
        value: convertExampleTypeReference(example.value, context)
    };
}

function convertExampleHeader(
    example: IrVersions.V19.http.ExampleHeader,
    context: IrMigrationContext
): IrVersions.V18.http.ExampleHeader {
    return {
        wireKey: example.wireKey,
        value: convertExampleTypeReference(example.value, context)
    };
}

function convertExampleQueryParameter(
    example: IrVersions.V19.http.ExampleQueryParameter,
    context: IrMigrationContext
): IrVersions.V18.http.ExampleQueryParameter {
    return {
        wireKey: example.wireKey,
        value: convertExampleTypeReference(example.value, context)
    };
}

function convertExampleRequest(
    example: IrVersions.V19.http.ExampleRequestBody,
    context: IrMigrationContext
): IrVersions.V18.http.ExampleRequestBody {
    return IrVersions.V19.http.ExampleRequestBody._visit<IrVersions.V18.http.ExampleRequestBody>(example, {
        inlinedRequestBody: (inlinedRequestBody) => {
            return IrVersions.V18.http.ExampleRequestBody.inlinedRequestBody({
                jsonExample: inlinedRequestBody.jsonExample,
                properties: inlinedRequestBody.properties.map((property) => ({
                    wireKey: property.wireKey,
                    value: convertExampleTypeReference(property.value, context),
                    originalTypeDeclaration: property.originalTypeDeclaration
                }))
            });
        },
        reference: (exampleReference) =>
            IrVersions.V18.http.ExampleRequestBody.reference(convertExampleTypeReference(exampleReference, context)),
        _unknown: () => {
            throw new Error("Unknown ExampleRequestBody: " + example.type);
        }
    });
}

function convertExampleResponse(
    example: IrVersions.V19.http.ExampleResponse,
    context: IrMigrationContext
): IrVersions.V18.http.ExampleResponse {
    return IrVersions.V19.http.ExampleResponse._visit<IrVersions.V18.http.ExampleResponse>(example, {
        ok: (okExample) =>
            IrVersions.V18.http.ExampleResponse.ok({
                body: okExample.body != null ? convertExampleTypeReference(okExample.body, context) : undefined
            }),
        error: (errorExample) =>
            IrVersions.V18.http.ExampleResponse.error({
                error: errorExample.error,
                body: errorExample.body != null ? convertExampleTypeReference(errorExample.body, context) : undefined
            }),
        _unknown: () => {
            throw new Error("Unknown ExampleResponse: " + example.type);
        }
    });
}

function convertTypeDeclaration(
    type: IrVersions.V19.types.TypeDeclaration,
    context: IrMigrationContext
): IrVersions.V18.types.TypeDeclaration {
    return {
        ...type,
        examples: type.examples.map((example) => convertExampleType(example, context))
    };
}

function convertExampleType(
    example: IrVersions.V19.types.ExampleType,
    context: IrMigrationContext
): IrVersions.V18.types.ExampleType {
    return {
        ...example,
        shape: convertExampleTypeShape(example.shape, context)
    };
}

function convertExampleTypeShape(
    example: IrVersions.V19.types.ExampleTypeShape,
    context: IrMigrationContext
): IrVersions.V18.types.ExampleTypeShape {
    return IrVersions.V19.types.ExampleTypeShape._visit<IrVersions.V18.types.ExampleTypeShape>(example, {
        alias: (aliasExample) =>
            IrVersions.V18.types.ExampleTypeShape.alias({
                value: convertExampleTypeReference(aliasExample.value, context)
            }),
        object: (objectExample) =>
            IrVersions.V18.types.ExampleTypeShape.object({
                properties: objectExample.properties.map((property) => ({
                    wireKey: property.wireKey,
                    value: convertExampleTypeReference(property.value, context),
                    originalTypeDeclaration: property.originalTypeDeclaration
                }))
            }),
        union: (unionExample) =>
            IrVersions.V18.types.ExampleTypeShape.union({
                wireDiscriminantValue: unionExample.wireDiscriminantValue,
                properties:
                    IrVersions.V19.types.ExampleSingleUnionTypeProperties._visit<IrVersions.V18.types.ExampleSingleUnionTypeProperties>(
                        unionExample.properties,
                        {
                            singleProperty: (singlePropertyExample) =>
                                IrVersions.V18.types.ExampleSingleUnionTypeProperties.singleProperty({
                                    jsonExample: singlePropertyExample.jsonExample,
                                    shape: convertExampleTypeReferenceShape(singlePropertyExample.shape, context)
                                }),
                            samePropertiesAsObject: (samePropertiesAsObjectExample) =>
                                IrVersions.V18.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                                    typeName: samePropertiesAsObjectExample.typeName,
                                    shape: convertExampleTypeShape(samePropertiesAsObjectExample.shape, context)
                                }),
                            noProperties: IrVersions.V18.types.ExampleSingleUnionTypeProperties.noProperties,
                            _unknown: () => {
                                throw new Error(
                                    "Unknown ExampleSingleUnionTypeProperties: " + unionExample.properties.type
                                );
                            }
                        }
                    )
            }),
        enum: IrVersions.V18.types.ExampleTypeShape.enum,
        _unknown: () => {
            throw new Error("Unknown ExampleTypeShape: " + example.type);
        }
    });
}

function convertExampleTypeReference(
    example: IrVersions.V19.types.ExampleTypeReference,
    context: IrMigrationContext
): IrVersions.V18.types.ExampleTypeReference {
    return {
        jsonExample: example.jsonExample,
        shape: convertExampleTypeReferenceShape(example.shape, context)
    };
}

function convertExampleTypeReferenceShape(
    example: IrVersions.V19.types.ExampleTypeReferenceShape,
    context: IrMigrationContext
): IrVersions.V18.types.ExampleTypeReferenceShape {
    return IrVersions.V19.types.ExampleTypeReferenceShape._visit<IrVersions.V18.types.ExampleTypeReferenceShape>(
        example,
        {
            primitive: (primitiveExample) =>
                IrVersions.V18.types.ExampleTypeReferenceShape.primitive(
                    convertExamplePrimitive(primitiveExample, context)
                ),
            named: (exampleNamedType) =>
                IrVersions.V18.types.ExampleTypeReferenceShape.named({
                    typeName: exampleNamedType.typeName,
                    shape: convertExampleTypeShape(exampleNamedType.shape, context)
                }),
            container: (exampleContainer) =>
                IrVersions.V18.types.ExampleTypeReferenceShape.container(
                    IrVersions.V19.types.ExampleContainer._visit<IrVersions.V18.types.ExampleContainer>(
                        exampleContainer,
                        {
                            list: (exampleListItems) =>
                                IrVersions.V18.types.ExampleContainer.list(
                                    exampleListItems.map((item) => convertExampleTypeReference(item, context))
                                ),
                            set: (exampleSetItems) =>
                                IrVersions.V18.types.ExampleContainer.set(
                                    exampleSetItems.map((item) => convertExampleTypeReference(item, context))
                                ),
                            optional: (maybeExample) =>
                                IrVersions.V18.types.ExampleContainer.optional(
                                    maybeExample != null
                                        ? convertExampleTypeReference(maybeExample, context)
                                        : undefined
                                ),
                            map: (exampleKeyValuePairs) =>
                                IrVersions.V18.types.ExampleContainer.map(
                                    exampleKeyValuePairs.map((exampleKeyValuePair) => ({
                                        key: convertExampleTypeReference(exampleKeyValuePair.key, context),
                                        value: convertExampleTypeReference(exampleKeyValuePair.value, context)
                                    }))
                                ),
                            _unknown: () => {
                                throw new Error("Unknown ExampleContainer: " + exampleContainer.type);
                            }
                        }
                    )
                ),
            unknown: IrVersions.V18.types.ExampleTypeReferenceShape.unknown,
            _unknown: () => {
                throw new Error("Unknown ExampleTypeReferenceShape: " + example.type);
            }
        }
    );
}

function convertExamplePrimitive(
    example: IrVersions.V19.types.ExamplePrimitive,
    { taskContext, targetGenerator }: IrMigrationContext
): IrVersions.V18.types.ExamplePrimitive {
    if (example.type === "date") {
        return taskContext.failAndThrow(
            targetGenerator != null
                ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                      " does not support examples for dates." +
                      ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                      " to a compatible version."
                : "Cannot backwards-migrate IR because this IR contains date examples."
        );
    }
    return example;
}
