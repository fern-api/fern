import { isPlainObject } from "@fern-api/core-utils";
import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import {
    ExampleEndpointCall,
    ExampleHeader,
    ExampleInlinedRequestBodyProperty,
    ExamplePathParameter,
    ExampleRequestBody,
    ExampleResponse,
} from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";
import {
    convertTypeReferenceExample,
    getOriginalTypeDeclarationForPropertyFromExtensions,
} from "../type-declarations/convertExampleType";

export function convertExampleEndpointCall({
    service,
    endpoint,
    example,
    typeResolver,
    errorResolver,
    exampleResolver,
    file,
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}): ExampleEndpointCall {
    return {
        name: example.name,
        docs: example.docs,
        ...convertPathParameters({ service, endpoint, example, typeResolver, exampleResolver, file }),
        ...convertHeaders({ service, endpoint, example, typeResolver, exampleResolver, file }),
        queryParameters:
            example["query-parameters"] != null
                ? Object.entries(example["query-parameters"]).map(([wireKey, value]) => {
                      const queryParameterDeclaration =
                          typeof endpoint.request !== "string"
                              ? endpoint.request?.["query-parameters"]?.[wireKey]
                              : undefined;
                      if (queryParameterDeclaration == null) {
                          throw new Error(`Query parameter ${wireKey} does not exist`);
                      }
                      return {
                          wireKey,
                          value: convertTypeReferenceExample({
                              example: value,
                              rawTypeBeingExemplified:
                                  typeof queryParameterDeclaration === "string"
                                      ? queryParameterDeclaration
                                      : queryParameterDeclaration.type,
                              typeResolver,
                              exampleResolver,
                              file,
                          }),
                      };
                  })
                : [],
        request: convertExampleRequestBody({ endpoint, example, typeResolver, exampleResolver, file }),
        response: convertExampleResponse({ endpoint, example, typeResolver, errorResolver, exampleResolver, file }),
    };
}

function convertPathParameters({
    service,
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}): Pick<ExampleEndpointCall, "endpointPathParameters" | "servicePathParameters"> {
    const servicePathParameters: ExamplePathParameter[] = [];
    const endpointPathParameters: ExamplePathParameter[] = [];

    if (example["path-parameters"] != null) {
        for (const [key, examplePathParameter] of Object.entries(example["path-parameters"])) {
            const endpointPathParameterDeclaration = endpoint["path-parameters"]?.[key];
            const servicePathParameterDeclaration = service["path-parameters"]?.[key];
            if (endpointPathParameterDeclaration != null) {
                endpointPathParameters.push({
                    key,
                    value: convertTypeReferenceExample({
                        example: examplePathParameter,
                        rawTypeBeingExemplified:
                            typeof endpointPathParameterDeclaration === "string"
                                ? endpointPathParameterDeclaration
                                : endpointPathParameterDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        file,
                    }),
                });
            } else if (servicePathParameterDeclaration != null) {
                servicePathParameters.push({
                    key,
                    value: convertTypeReferenceExample({
                        example: examplePathParameter,
                        rawTypeBeingExemplified:
                            typeof servicePathParameterDeclaration === "string"
                                ? servicePathParameterDeclaration
                                : servicePathParameterDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        file,
                    }),
                });
            } else {
                throw new Error(`Path parameter ${key} does not exist`);
            }
        }
    }

    return {
        endpointPathParameters,
        servicePathParameters,
    };
}

function convertHeaders({
    service,
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}): Pick<ExampleEndpointCall, "endpointHeaders" | "serviceHeaders"> {
    const serviceHeaders: ExampleHeader[] = [];
    const endpointHeaders: ExampleHeader[] = [];

    if (example.headers != null) {
        for (const [wireKey, exampleHeader] of Object.entries(example.headers)) {
            const endpointHeaderDeclaration =
                typeof endpoint.request !== "string" ? endpoint.request?.headers?.[wireKey] : undefined;
            const serviceHeaderDeclaration = service.headers?.[wireKey];
            if (endpointHeaderDeclaration != null) {
                endpointHeaders.push({
                    wireKey,
                    value: convertTypeReferenceExample({
                        example: exampleHeader,
                        rawTypeBeingExemplified:
                            typeof endpointHeaderDeclaration === "string"
                                ? endpointHeaderDeclaration
                                : endpointHeaderDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        file,
                    }),
                });
            } else if (serviceHeaderDeclaration != null) {
                serviceHeaders.push({
                    wireKey,
                    value: convertTypeReferenceExample({
                        example: exampleHeader,
                        rawTypeBeingExemplified:
                            typeof serviceHeaderDeclaration === "string"
                                ? serviceHeaderDeclaration
                                : serviceHeaderDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        file,
                    }),
                });
            } else {
                throw new Error(`Heder ${wireKey} does not exist`);
            }
        }
    }

    return {
        endpointHeaders,
        serviceHeaders,
    };
}

function convertExampleRequestBody({
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}): ExampleRequestBody | undefined {
    const requestType = typeof endpoint.request !== "string" ? endpoint.request?.body : endpoint.request;
    if (requestType == null) {
        return undefined;
    }
    if (!isInlineRequestBody(requestType)) {
        return ExampleRequestBody.reference(
            convertTypeReferenceExample({
                example: example.request,
                rawTypeBeingExemplified: typeof requestType !== "string" ? requestType.type : requestType,
                typeResolver,
                exampleResolver,
                file,
            })
        );
    }

    if (!isPlainObject(example.request)) {
        throw new Error("Example is not an object");
    }

    const exampleProperties: ExampleInlinedRequestBodyProperty[] = [];
    for (const [wireKey, propertyExample] of Object.entries(example.request)) {
        const inlinedRequestPropertyDeclaration = requestType.properties?.[wireKey];
        if (inlinedRequestPropertyDeclaration != null) {
            exampleProperties.push({
                wireKey,
                value: convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof inlinedRequestPropertyDeclaration !== "string"
                            ? inlinedRequestPropertyDeclaration.type
                            : inlinedRequestPropertyDeclaration,
                    typeResolver,
                    exampleResolver,
                    file,
                }),
                originalTypeDeclaration: undefined,
            });
        } else {
            const originalTypeDeclaration = getOriginalTypeDeclarationForPropertyFromExtensions({
                extends_: requestType.extends,
                wirePropertyKey: wireKey,
                typeResolver,
                file,
            });
            if (originalTypeDeclaration == null) {
                throw new Error("Could not find original type declaration for property: " + wireKey);
            }
            exampleProperties.push({
                wireKey,
                value: convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof originalTypeDeclaration.rawPropertyType === "string"
                            ? originalTypeDeclaration.rawPropertyType
                            : originalTypeDeclaration.rawPropertyType.type,
                    typeResolver,
                    exampleResolver,
                    file,
                }),
                originalTypeDeclaration: originalTypeDeclaration.typeName,
            });
        }
    }

    return ExampleRequestBody.inlinedRequestBody({
        jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({ example: example.request, file })
            .resolvedExample,
        properties: exampleProperties,
    });
}

function convertExampleResponse({
    endpoint,
    example,
    typeResolver,
    errorResolver,
    exampleResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}): ExampleResponse {
    if (example.response?.error != null) {
        const errorDeclaration = errorResolver.getDeclarationOrThrow(example.response.error, file);
        return ExampleResponse.error({
            error: parseTypeName({
                typeName: example.response.error,
                file,
            }),
            body:
                errorDeclaration.declaration.type != null
                    ? convertTypeReferenceExample({
                          example: example.response.body,
                          rawTypeBeingExemplified: errorDeclaration.declaration.type,
                          typeResolver,
                          exampleResolver,
                          file: errorDeclaration.file,
                      })
                    : undefined,
        });
    }

    return ExampleResponse.ok({
        body: convertExampleResponseBody({ endpoint, example, typeResolver, exampleResolver, file }),
    });
}

function convertExampleResponseBody({
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
}) {
    const responseBodyType = typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response;
    if (responseBodyType == null) {
        return undefined;
    }
    return convertTypeReferenceExample({
        example: example.response?.body,
        rawTypeBeingExemplified: responseBodyType,
        typeResolver,
        exampleResolver,
        file,
    });
}
