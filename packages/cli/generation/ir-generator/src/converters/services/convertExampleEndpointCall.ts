import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import {
    ExampleEndpointCall,
    ExampleInlinedRequestBodyProperty,
    ExampleRequestBody,
    ExampleResponse,
} from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";
import {
    convertTypeReferenceExample,
    getOriginalTypeDeclarationForPropertyFromExtensions,
} from "../type-declarations/convertTypeExample";

export function convertExampleEndpointCall({
    endpoint,
    example,
    typeResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ExampleEndpointCall {
    return {
        "path-parameters":
            example["path-parameters"] != null
                ? Object.entries(example["path-parameters"]).map(([key, value]) => {
                      const pathParameterDeclaration = endpoint["path-parameters"]?.[key];
                      if (pathParameterDeclaration == null) {
                          throw new Error(`Path parameter ${key} does not exist`);
                      }
                      return {
                          key,
                          value: convertTypeReferenceExample({
                              example: value,
                              rawTypeBeingExemplified:
                                  typeof pathParameterDeclaration === "string"
                                      ? pathParameterDeclaration
                                      : pathParameterDeclaration.type,
                              typeResolver,
                              file,
                          }),
                      };
                  })
                : [],
        "query-parameters":
            example["query-parameters"] != null
                ? Object.entries(example["query-parameters"]).map(([key, value]) => {
                      const queryParameterDeclaration =
                          typeof endpoint.request !== "string"
                              ? endpoint.request?.["query-parameters"]?.[key]
                              : undefined;
                      if (queryParameterDeclaration == null) {
                          throw new Error(`Query parameter ${key} does not exist`);
                      }
                      return {
                          key,
                          value: convertTypeReferenceExample({
                              example: value,
                              rawTypeBeingExemplified:
                                  typeof queryParameterDeclaration === "string"
                                      ? queryParameterDeclaration
                                      : queryParameterDeclaration.type,
                              typeResolver,
                              file,
                          }),
                      };
                  })
                : [],
        headers:
            example.headers != null
                ? Object.entries(example.headers).map(([key, value]) => {
                      const headerDeclaration =
                          typeof endpoint.request !== "string" ? endpoint.request?.headers?.[key] : undefined;
                      if (headerDeclaration == null) {
                          throw new Error(`Header ${key} does not exist`);
                      }
                      return {
                          key,
                          value: convertTypeReferenceExample({
                              example: value,
                              rawTypeBeingExemplified:
                                  typeof headerDeclaration === "string" ? headerDeclaration : headerDeclaration.type,
                              typeResolver,
                              file,
                          }),
                      };
                  })
                : [],
        request: convertExampleRequestBody({ endpoint, example, typeResolver, file }),
        response: convertExampleResponse({ endpoint, example, typeResolver, file }),
    };
}

function convertExampleRequestBody({
    endpoint,
    example,
    typeResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
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
                file,
            })
        );
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
                    file,
                }),
                originalTypeDeclaration: originalTypeDeclaration.typeName,
            });
        }
    }

    return ExampleRequestBody.inlinedRequestBody({
        properties: exampleProperties,
    });
}

function convertExampleResponse({
    endpoint,
    example,
    typeResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ExampleResponse {
    const exampleBody = convertExampleResponseBody({ endpoint, example, typeResolver, file });
    if (example.response?.error != null) {
        return ExampleResponse.error({
            error: parseTypeName({
                typeName: example.response.error,
                file,
            }),
            body: exampleBody,
        });
    }

    return ExampleResponse.ok({ body: exampleBody });
}

function convertExampleResponseBody({
    endpoint,
    example,
    typeResolver,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
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
        file,
    });
}
