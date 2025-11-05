import { assertNever } from "@fern-api/core-utils";
import {
    ErrorDeclaration,
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
    ExampleInlinedRequestBodyProperty,
    ExampleRequestBody,
    ExampleResponse,
    ExampleTypeReference,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";

import { hashJSON } from "../../hashJSON";
import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional";
import { ExampleGenerationResult } from "./ExampleGenerationResult";
import {
    generateHeaderExamples,
    generatePathParameterExamples,
    generateQueryParameterExamples
} from "./generateParameterExamples";
import { generateTypeDeclarationExample } from "./generateTypeDeclarationExample";
import { createExampleGenerationCache, generateTypeReferenceExample } from "./generateTypeReferenceExample";

export declare namespace generateEndpointExample {
    interface Args {
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        service: HttpService;
        endpoint: HttpEndpoint;
        typeDeclarations: Record<TypeId, TypeDeclaration>;

        skipOptionalRequestProperties: boolean;

        generationResponse: GenerationResponseType;
    }

    type GenerationResponseType = SuccessResponseType | ErrorResponseType;

    interface SuccessResponseType {
        type: "success";
    }

    interface ErrorResponseType {
        type: "error";
        declaration: ErrorDeclaration;
    }
}

const TEXT_TYPE_REFERENCE = TypeReference.primitive({
    v1: PrimitiveTypeV1.String,
    v2: PrimitiveTypeV2.string({
        default: undefined,
        validation: undefined
    })
});

export function generateEndpointExample({
    ir,
    endpoint,
    service,
    typeDeclarations,
    skipOptionalRequestProperties,
    generationResponse
}: generateEndpointExample.Args): ExampleGenerationResult<ExampleEndpointCall> {
    const cache = createExampleGenerationCache();
    
    const result: Omit<ExampleEndpointCall, "id" | "url"> = {
        name: undefined,
        endpointHeaders: [],
        endpointPathParameters: [],
        queryParameters: [],
        servicePathParameters: [],
        serviceHeaders: [],
        rootPathParameters: [],
        request: undefined,
        response: ExampleResponse.ok(ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };

    const endpointPathResult = generatePathParameterExamples(endpoint.pathParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1,
        cache
    });
    if (endpointPathResult.type === "failure") {
        return endpointPathResult;
    }
    result.endpointPathParameters = endpointPathResult.example;

    const servicePathResult = generatePathParameterExamples(service.pathParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1,
        cache
    });
    if (servicePathResult.type === "failure") {
        return servicePathResult;
    }
    result.servicePathParameters = servicePathResult.example;

    const rootPathResult = generatePathParameterExamples(ir.pathParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1,
        cache
    });
    if (rootPathResult.type === "failure") {
        return rootPathResult;
    }
    result.rootPathParameters = rootPathResult.example;

    const queryParamsResult = generateQueryParameterExamples(endpoint.queryParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 10,
        cache
    });
    if (queryParamsResult.type === "failure") {
        return queryParamsResult;
    }
    result.queryParameters = queryParamsResult.example;

    const endpointHeadersResult = generateHeaderExamples(endpoint.headers, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1,
        cache
    });
    if (endpointHeadersResult.type === "failure") {
        return endpointHeadersResult;
    }
    result.endpointHeaders = endpointHeadersResult.example;

    const serviceHeadersResult = generateHeaderExamples(service.headers, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1,
        cache
    });
    if (serviceHeadersResult.type === "failure") {
        return serviceHeadersResult;
    }
    result.serviceHeaders = serviceHeadersResult.example;

    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.type) {
            case "bytes":
                return { type: "failure", message: "Bytes request unsupported" };
            case "fileUpload":
                return { type: "failure", message: "File upload unsupported" };
            case "inlinedRequestBody": {
                const jsonExample: Record<string, unknown> = {};
                const properties: ExampleInlinedRequestBodyProperty[] = [];

                if (endpoint.requestBody.extends != null) {
                    for (const extendedTypeReference of endpoint.requestBody.extends) {
                        const extendedTypeDeclaration = typeDeclarations[extendedTypeReference.typeId];
                        if (extendedTypeDeclaration == null) {
                            throw new Error(
                                `Failed to find extended type declaration with id ${extendedTypeReference.typeId}`
                            );
                        }
                        const extendedExample = generateTypeDeclarationExample({
                            typeDeclaration: extendedTypeDeclaration,
                            typeDeclarations,
                            currentDepth: 1,
                            maxDepth: 10,
                            skipOptionalProperties: skipOptionalRequestProperties,
                            cache
                        });
                        if (extendedExample == null) {
                            continue;
                        }
                        if (extendedExample.type === "success") {
                            Object.assign(jsonExample, extendedExample.jsonExample);
                        }
                    }
                }

                for (const property of [
                    ...(endpoint.requestBody.properties ?? []),
                    ...(endpoint.requestBody.extendedProperties ?? [])
                ]) {
                    const propertyExample = generateTypeReferenceExample({
                        fieldName: property.name.wireValue,
                        typeReference: property.valueType,
                        typeDeclarations,
                        currentDepth: 1,
                        maxDepth: 10,
                        skipOptionalProperties: skipOptionalRequestProperties,
                        cache
                    });
                    if (
                        propertyExample.type === "failure" &&
                        !isTypeReferenceOptional({ typeDeclarations, typeReference: property.valueType })
                    ) {
                        return {
                            type: "failure",
                            message: `Failed to generate required property ${property.name.wireValue} b/c ${propertyExample.message}`
                        };
                    } else if (propertyExample.type === "failure") {
                        continue;
                    }
                    const { example, jsonExample: propertyJsonExample } = propertyExample;
                    properties.push({
                        name: property.name,
                        originalTypeDeclaration: undefined,
                        value: example
                    });
                    jsonExample[property.name.wireValue] = propertyJsonExample;
                }
                result.request = ExampleRequestBody.inlinedRequestBody({
                    jsonExample,
                    properties,
                    extraProperties: undefined
                });
                break;
            }
            case "reference": {
                const generatedExample = generateTypeReferenceExample({
                    currentDepth: 0,
                    maxDepth: 10,
                    typeDeclarations,
                    typeReference: endpoint.requestBody.requestBodyType,
                    skipOptionalProperties: skipOptionalRequestProperties,
                    cache
                });
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example } = generatedExample;
                result.request = ExampleRequestBody.reference(example);
                break;
            }
            default:
                assertNever(endpoint.requestBody);
        }
    }

    if (generationResponse.type === "success" && endpoint.response?.body != null) {
        switch (endpoint.response.body.type) {
            case "fileDownload":
                return { type: "failure", message: "File download unsupported" };
            case "json": {
                const generatedExample = generateTypeReferenceExample({
                    currentDepth: 0,
                    maxDepth: 10,
                    typeDeclarations,
                    typeReference: endpoint.response.body.value.responseBodyType,
                    skipOptionalProperties: false,
                    cache
                });
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example, jsonExample } = generatedExample;
                result.response = ExampleResponse.ok(ExampleEndpointSuccessResponse.body({ ...example, jsonExample }));
                break;
            }
            case "streamParameter": {
                let generatedExample: ExampleGenerationResult<ExampleTypeReference> | undefined = undefined;
                switch (endpoint.response.body.nonStreamResponse.type) {
                    case "bytes":
                        return { type: "failure", message: "Bytes unsupported" };
                    case "fileDownload":
                        return { type: "failure", message: "File download unsupported" };
                    case "json":
                        generatedExample = generateTypeReferenceExample({
                            currentDepth: 0,
                            maxDepth: 10,
                            typeDeclarations,
                            typeReference: endpoint.response.body.nonStreamResponse.value.responseBodyType,
                            skipOptionalProperties: false,
                            cache
                        });
                        break;
                    case "text":
                        generatedExample = generateTypeReferenceExample({
                            currentDepth: 0,
                            maxDepth: 10,
                            typeDeclarations,
                            typeReference: TEXT_TYPE_REFERENCE,
                            skipOptionalProperties: false,
                            cache
                        });
                        break;
                    default:
                        assertNever(endpoint.response.body.nonStreamResponse);
                }
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example, jsonExample } = generatedExample;
                result.response = ExampleResponse.ok(ExampleEndpointSuccessResponse.body({ ...example, jsonExample }));
                break;
            }
            case "streaming": {
                let generatedExample: ExampleGenerationResult<ExampleTypeReference> | undefined = undefined;
                switch (endpoint.response.body.value.type) {
                    case "sse": {
                        generatedExample = generateTypeReferenceExample({
                            currentDepth: 0,
                            maxDepth: 10,
                            typeDeclarations,
                            typeReference: endpoint.response.body.value.payload,
                            skipOptionalProperties: false,
                            cache
                        });
                        if (generatedExample.type === "failure") {
                            return generatedExample;
                        }
                        const { example, jsonExample } = generatedExample;
                        result.response = ExampleResponse.ok(
                            ExampleEndpointSuccessResponse.sse([{ data: { ...example, jsonExample }, event: "" }])
                        );
                        break;
                    }
                    case "json": {
                        generatedExample = generateTypeReferenceExample({
                            currentDepth: 0,
                            maxDepth: 10,
                            typeDeclarations,
                            typeReference: endpoint.response.body.value.payload,
                            skipOptionalProperties: false,
                            cache
                        });
                        if (generatedExample.type === "failure") {
                            return generatedExample;
                        }
                        const { example, jsonExample } = generatedExample;
                        result.response = ExampleResponse.ok(
                            ExampleEndpointSuccessResponse.stream([{ ...example, jsonExample }])
                        );
                        break;
                    }
                    case "text": {
                        generatedExample = generateTypeReferenceExample({
                            currentDepth: 0,
                            maxDepth: 10,
                            typeDeclarations,
                            typeReference: TEXT_TYPE_REFERENCE,
                            skipOptionalProperties: false,
                            cache
                        });
                        if (generatedExample.type === "failure") {
                            return generatedExample;
                        }
                        const { example, jsonExample } = generatedExample;
                        result.response = ExampleResponse.ok(
                            ExampleEndpointSuccessResponse.stream([{ ...example, jsonExample }])
                        );
                        break;
                    }
                    default:
                        assertNever(endpoint.response.body.value);
                }

                break;
            }
            case "text": {
                const generatedExample = generateTypeReferenceExample({
                    currentDepth: 0,
                    maxDepth: 10,
                    typeDeclarations,
                    typeReference: TEXT_TYPE_REFERENCE,
                    skipOptionalProperties: false,
                    cache
                });
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example, jsonExample } = generatedExample;
                result.response = ExampleResponse.ok(ExampleEndpointSuccessResponse.body({ ...example, jsonExample }));
                break;
            }
            case "bytes":
                return { type: "failure", message: "Bytes unsupported" };
            default:
                assertNever(endpoint.response.body);
        }
    } else if (generationResponse.type === "error") {
        if (generationResponse.declaration.type == null) {
            result.response = ExampleResponse.error({
                body: undefined,
                error: generationResponse.declaration.name
            });
        } else {
            const generatedExample = generateTypeReferenceExample({
                currentDepth: 0,
                maxDepth: 10,
                typeDeclarations,
                typeReference: generationResponse.declaration.type,
                skipOptionalProperties: skipOptionalRequestProperties,
                cache
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example } = generatedExample;
            result.response = ExampleResponse.error({
                body: example,
                error: generationResponse.declaration.name
            });
        }
    }

    try {
        const hashed = hashJSON(result);
        return {
            type: "success",
            example: {
                id: hashed,
                url: getUrlForExample(endpoint, result),
                ...result
            },
            jsonExample: undefined // dummy
        };
    } catch (e) {
        return { type: "failure", message: `Parse failure with exceptions ${e}` };
    }
}

function getUrlForExample(endpoint: HttpEndpoint, example: Omit<ExampleEndpointCall, "id" | "url">): string {
    const pathParameters: Record<string, string> = {};
    [...example.rootPathParameters, ...example.servicePathParameters, ...example.endpointPathParameters].forEach(
        (examplePathParameter) => {
            const value = examplePathParameter.value.jsonExample;
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);
            pathParameters[examplePathParameter.name.originalName] = stringValue;
        }
    );
    const url =
        endpoint.fullPath.head +
        endpoint.fullPath.parts
            .map((pathPart) => encodeURIComponent(`${pathParameters[pathPart.pathParameter]}`) + pathPart.tail)
            .join("");
    return url.startsWith("/") || url === "" ? url : `/${url}`;
}
