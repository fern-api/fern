import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V32_TO_V31_MIGRATION: IrMigration<
    IrVersions.V32.ir.IntermediateRepresentation,
    IrVersions.V31.ir.IntermediateRepresentation
> = {
    laterVersion: "v32",
    earlierVersion: "v31",
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
        [GeneratorName.GO_FIBER]: "0.9.4-2-g139cf36",
        [GeneratorName.GO_MODEL]: "0.9.4-2-g139cf36",
        [GeneratorName.GO_SDK]: "0.9.4-2-g139cf36",
        [GeneratorName.RUBY_MODEL]: "0.0.0",
        [GeneratorName.RUBY_SDK]: "0.0.0",
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V31.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v32): IrVersions.V31.ir.IntermediateRepresentation => {
        return {
            ...v32,
            types: Object.fromEntries(
                Object.entries(v32.types).map(([typeId, type]) => {
                    return [typeId, { ...type, examples: convertExampleTypes(type.examples) }];
                })
            ),
            services: Object.fromEntries(
                Object.entries(v32.services).map(([serviceId, service]) => {
                    return [serviceId, { ...service, endpoints: service.endpoints.map(convertEndpoint) }];
                })
            )
        };
    }
};

function convertExamples<V32, V31>({
    examples,
    convert
}: {
    examples: V32[];
    convert: (val: V32) => V31 | undefined;
}): V31[] {
    const convertedExamples = [];
    for (const example of examples) {
        const convertedExampleEndpointCall = convert(example);
        if (convertedExampleEndpointCall != null) {
            convertedExamples.push(convertedExampleEndpointCall);
        }
    }
    return convertedExamples;
}

function convertEndpoint(endpoint: IrVersions.V32.HttpEndpoint): IrVersions.V31.HttpEndpoint {
    return {
        ...endpoint,
        examples: convertExamples({
            examples: endpoint.examples,
            convert: convertExampleEndpointCall
        })
    };
}

function convertExampleEndpointCall(
    example: IrVersions.V32.ExampleEndpointCall
): IrVersions.V31.ExampleEndpointCall | undefined {
    let convertedExampleRequest = undefined;
    if (example.request != null) {
        convertedExampleRequest = convertExampleRequestBody(example.request);
        if (convertedExampleRequest == null) {
            return undefined;
        }
    }
    const convertedResponse = convertExampleResponse(example.response);
    if (convertedResponse == null) {
        return undefined;
    }
    return {
        ...example,
        rootPathParameters: convertExamples({
            examples: example.rootPathParameters,
            convert: convertExamplePathParameter
        }),
        endpointPathParameters: convertExamples({
            examples: example.endpointPathParameters,
            convert: convertExamplePathParameter
        }),
        servicePathParameters: convertExamples({
            examples: example.servicePathParameters,
            convert: convertExamplePathParameter
        }),
        endpointHeaders: convertExamples({
            examples: example.endpointHeaders,
            convert: convertExampleHeader
        }),
        serviceHeaders: convertExamples({
            examples: example.serviceHeaders,
            convert: convertExampleHeader
        }),
        queryParameters: convertExamples({
            examples: example.queryParameters,
            convert: convertExampleQueryParams
        }),
        request: convertedExampleRequest,
        response: convertedResponse
    };
}

function convertExampleRequestBody(
    example: IrVersions.V32.ExampleRequestBody
): IrVersions.V31.ExampleRequestBody | undefined {
    switch (example.type) {
        case "inlinedRequestBody": {
            const convertedProperties = [];
            for (const objectProperty of example.properties) {
                const convertedTypeReference = convertExampleTypeReference(objectProperty.value);
                if (convertedTypeReference == null) {
                    continue;
                }
                convertedProperties.push({
                    ...objectProperty,
                    value: convertedTypeReference
                });
            }
            return IrVersions.V31.ExampleRequestBody.inlinedRequestBody({
                ...example,
                properties: convertedProperties
            });
        }
        case "reference": {
            const convertedExampleShape = convertExampleTypeReferenceShape(example.shape);
            if (convertedExampleShape == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleRequestBody.reference({
                ...example,
                shape: convertedExampleShape
            });
        }
        default:
            assertNever(example);
    }
}

function convertExampleResponse(example: IrVersions.V32.ExampleResponse): IrVersions.V31.ExampleResponse | undefined {
    switch (example.type) {
        case "ok": {
            if (example.body == null) {
                return IrVersions.V31.ExampleResponse.ok({
                    body: undefined
                });
            }
            const convertedBody = convertExampleTypeReference(example.body);
            if (convertedBody == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleResponse.ok({
                body: convertedBody
            });
        }
        case "error": {
            if (example.body == null) {
                return IrVersions.V31.ExampleResponse.error({
                    ...example,
                    body: undefined
                });
            }
            const convertedBody = convertExampleTypeReference(example.body);
            if (convertedBody == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleResponse.error({
                ...example,
                body: convertedBody
            });
        }
    }
}

function convertExamplePathParameter(
    example: IrVersions.V32.ExamplePathParameter
): IrVersions.V31.ExamplePathParameter | undefined {
    const convertedPathParameterValue = convertExampleTypeReference(example.value);
    if (convertedPathParameterValue == null) {
        return undefined;
    }
    return {
        ...example,
        value: convertedPathParameterValue
    };
}

function convertExampleHeader(example: IrVersions.V32.ExampleHeader): IrVersions.V31.ExampleHeader | undefined {
    const convertedHeaderValue = convertExampleTypeReference(example.value);
    if (convertedHeaderValue == null) {
        return undefined;
    }
    return {
        ...example,
        value: convertedHeaderValue
    };
}

function convertExampleQueryParams(
    example: IrVersions.V32.ExampleQueryParameter
): IrVersions.V31.ExampleQueryParameter | undefined {
    const convertedQueryParameterValue = convertExampleTypeReference(example.value);
    if (convertedQueryParameterValue == null) {
        return undefined;
    }
    return {
        ...example,
        value: convertedQueryParameterValue
    };
}

function convertExampleTypes(examples: IrVersions.V32.ExampleType[]): IrVersions.V31.ExampleType[] {
    const convertedExamples = [];
    for (const example of examples) {
        const convertedExampleType = convertExampleType(example);
        if (convertedExampleType != null) {
            convertedExamples.push(convertedExampleType);
        }
    }
    return convertedExamples;
}

function convertExampleType(example: IrVersions.V32.ExampleType): IrVersions.V31.ExampleType | undefined {
    const convertedShape = convertExampleTypeShape(example.shape);
    if (convertedShape == null) {
        return undefined;
    }
    return {
        ...example,
        shape: convertedShape
    };
}

function convertExampleTypeShape(
    example: IrVersions.V32.ExampleTypeShape
): IrVersions.V31.ExampleTypeShape | undefined {
    switch (example.type) {
        case "enum":
            return IrVersions.V31.ExampleTypeShape.enum(example);
        case "alias": {
            const convertedTypeReference = convertExampleTypeReference(example.value);
            if (convertedTypeReference == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleTypeShape.alias({
                value: convertedTypeReference
            });
        }
        case "object": {
            const convertedProperties = [];
            for (const objectProperty of example.properties) {
                const convertedTypeReference = convertExampleTypeReference(objectProperty.value);
                if (convertedTypeReference == null) {
                    continue;
                }
                convertedProperties.push({
                    ...objectProperty,
                    value: convertedTypeReference
                });
            }
            return IrVersions.V31.ExampleTypeShape.object({
                properties: convertedProperties
            });
        }
        case "union": {
            const convertedSingleUnionTypeShape = convertExampleSingleUnionType(example.singleUnionType);
            if (convertedSingleUnionTypeShape == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleTypeShape.union({
                ...example,
                singleUnionType: convertedSingleUnionTypeShape
            });
        }
        case "undiscriminatedUnion":
            return undefined;
        default:
            assertNever(example);
    }
}

function convertExampleTypeReference(
    example: IrVersions.V32.ExampleTypeReference
): IrVersions.V31.ExampleTypeReference | undefined {
    const convertedExampleTypeReferenceShape = convertExampleTypeReferenceShape(example.shape);
    if (convertedExampleTypeReferenceShape == null) {
        return undefined;
    }
    return {
        shape: convertedExampleTypeReferenceShape,
        jsonExample: example.jsonExample
    };
}

function convertExampleSingleUnionType(
    example: IrVersions.V32.ExampleSingleUnionType
): IrVersions.V31.ExampleSingleUnionType | undefined {
    const convertedProperties = convertExampleSingleUnionTypeProperties(example.shape);
    if (convertedProperties == null) {
        return undefined;
    }
    return {
        ...example,
        shape: convertedProperties
    };
}

function convertExampleSingleUnionTypeProperties(
    example: IrVersions.V32.ExampleSingleUnionTypeProperties
): IrVersions.V31.ExampleSingleUnionTypeProperties | undefined {
    switch (example.type) {
        case "noProperties":
            return IrVersions.V31.ExampleSingleUnionTypeProperties.noProperties();
        case "singleProperty": {
            const convertedSingleProperty = convertExampleTypeReferenceShape(example.shape);
            if (convertedSingleProperty == null) {
                return;
            }
            return IrVersions.V31.ExampleSingleUnionTypeProperties.singleProperty({
                ...example,
                shape: convertedSingleProperty
            });
        }
        case "samePropertiesAsObject": {
            const convertedProperties = [];
            for (const objectProperty of example.object.properties) {
                const convertedTypeReference = convertExampleTypeReference(objectProperty.value);
                if (convertedTypeReference == null) {
                    continue;
                }
                convertedProperties.push({
                    ...objectProperty,
                    value: convertedTypeReference
                });
            }
            return IrVersions.V31.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                ...example,
                object: {
                    properties: convertedProperties
                }
            });
        }
        default:
            assertNever(example);
    }
}

function convertExampleTypeReferenceShape(
    example: IrVersions.V32.ExampleTypeReferenceShape
): IrVersions.V31.ExampleTypeReferenceShape | undefined {
    switch (example.type) {
        case "container": {
            const convertedExampleContainer = convertExampleContainer(example.container);
            if (convertedExampleContainer == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleTypeReferenceShape.container(convertedExampleContainer);
        }
        case "named": {
            const convertedShape = convertExampleTypeShape(example.shape);
            if (convertedShape == null) {
                return undefined;
            }
            return IrVersions.V31.ExampleTypeReferenceShape.named({
                ...example,
                shape: convertedShape
            });
        }
        case "primitive":
            return IrVersions.V31.ExampleTypeReferenceShape.primitive(example.primitive);
        case "unknown":
            return IrVersions.V31.ExampleTypeReferenceShape.unknown(example.unknown);
        default:
            assertNever(example);
    }
}

function convertExampleContainer(
    example: IrVersions.V32.ExampleContainer
): IrVersions.V31.ExampleContainer | undefined {
    switch (example.type) {
        case "list": {
            const items = [];
            for (const item of example.list) {
                const convertedItem = convertExampleTypeReference(item);
                if (convertedItem != null) {
                    items.push(convertedItem);
                }
            }
            return IrVersions.V31.ExampleContainer.list(items);
        }
        case "set": {
            const items = [];
            for (const item of example.set) {
                const convertedItem = convertExampleTypeReference(item);
                if (convertedItem != null) {
                    items.push(convertedItem);
                }
            }
            return IrVersions.V31.ExampleContainer.set(items);
        }
        case "map": {
            const entries = [];
            for (const entry of example.map) {
                const convertedKey = convertExampleTypeReference(entry.key);
                const convertedValue = convertExampleTypeReference(entry.value);
                if (convertedKey != null && convertedValue != null) {
                    entries.push({
                        key: convertedKey,
                        value: convertedValue
                    });
                }
            }
            return IrVersions.V31.ExampleContainer.map(entries);
        }
        case "optional": {
            if (example.optional == null) {
                return IrVersions.V31.ExampleContainer.optional();
            }
            const convertedValue = convertExampleTypeReference(example.optional);
            if (convertedValue == null) {
                return IrVersions.V31.ExampleContainer.optional();
            }
            return IrVersions.V31.ExampleContainer.optional(convertedValue);
        }
        default:
            assertNever(example);
    }
}
