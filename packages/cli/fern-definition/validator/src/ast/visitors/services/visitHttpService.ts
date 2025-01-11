import { noop, visitObject } from "@fern-api/core-utils";
import {
    NodePath,
    RawSchemas,
    isInlineRequestBody,
    isVariablePathParameter,
    visitExampleResponseSchema
} from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";
import { RootApiFileAstVisitor } from "../../RootApiFileAstVisitor";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { visitAllReferencesInExample } from "../utils/visitAllReferencesInExample";
import { createTypeReferenceVisitor } from "../utils/visitTypeReference";

export function visitHttpService({
    service,
    visitor,
    nodePath
}: {
    service: RawSchemas.HttpServiceSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): void {
    visitor.httpService?.(service, nodePath);

    visitObject(service, {
        url: (url) => {
            visitor.serviceBaseUrl?.(url, [...nodePath, "url"]);
        },
        "base-path": noop,
        "display-name": noop,
        availability: noop,
        headers: (headers) => {
            visitHeaders({
                headers,
                visitor,
                nodePath: [...nodePath, "headers"]
            });
        },
        audiences: noop,
        auth: noop,
        "path-parameters": (pathParameters) => {
            visitPathParameters({
                pathParameters,
                visitor,
                nodePath: [...nodePath, "path-parameters"]
            });
        },
        endpoints: (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                const nodePathForEndpoint = [...nodePath, "endpoints", endpointId];
                visitEndpoint({ endpointId, endpoint, service, visitor, nodePathForEndpoint });
            }
        },
        idempotent: noop,
        transport: noop,
        source: noop
    });
}

function visitEndpoint({
    endpointId,
    endpoint,
    service,
    visitor,
    nodePathForEndpoint
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    service: RawSchemas.HttpServiceSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForEndpoint: NodePath;
}) {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    visitor.httpEndpoint?.({ endpointId, endpoint, service }, nodePathForEndpoint);
    visitObject(endpoint, {
        docs: createDocsVisitor(visitor, nodePathForEndpoint),
        "display-name": noop,
        availability: noop,
        "base-path": noop,
        path: noop,
        idempotent: noop,
        url: (baseUrl) => {
            visitor.endpointBaseUrl?.({ baseUrl, service }, [...nodePathForEndpoint, "url"]);
        },
        "path-parameters": (pathParameters) => {
            visitPathParameters({
                pathParameters,
                visitor,
                nodePath: [...nodePathForEndpoint, "path-parameters"]
            });
        },
        request: (request) => {
            if (request == null) {
                return;
            }
            const nodePathForRequest = [...nodePathForEndpoint, "request"];
            if (typeof request === "string") {
                visitTypeReference(request, nodePathForRequest, {
                    location: "requestReference"
                });
                return;
            }
            visitObject(request, {
                name: noop,
                docs: createDocsVisitor(visitor, nodePathForRequest),
                "path-parameters": (pathParameters) => {
                    visitPathParameters({
                        pathParameters,
                        visitor,
                        nodePath: [...nodePathForRequest, "path-parameters"]
                    });
                },
                "query-parameters": (queryParameters) => {
                    if (queryParameters == null) {
                        return;
                    }
                    for (const [queryParameterKey, queryParameter] of Object.entries(queryParameters)) {
                        const nodePathForQueryParameter = [
                            ...nodePathForRequest,
                            "query-parameters",
                            queryParameterKey
                        ];
                        visitor.queryParameter?.({ queryParameterKey, queryParameter }, nodePathForQueryParameter);

                        if (typeof queryParameter === "string") {
                            visitTypeReference(queryParameter, nodePathForQueryParameter);
                        } else {
                            visitObject(queryParameter, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForQueryParameter),
                                availability: noop,
                                type: (type) => {
                                    visitTypeReference(type, [...nodePathForQueryParameter, "type"], {
                                        _default: queryParameter.default,
                                        validation: queryParameter.validation
                                    });
                                },
                                "allow-multiple": noop,
                                audiences: noop,
                                encoding: noop,
                                default: noop,
                                validation: noop
                            });
                        }
                    }
                },
                "content-type": noop,
                headers: (headers) => {
                    visitHeaders({
                        headers,
                        visitor,
                        nodePath: [...nodePathForRequest, "headers"]
                    });
                },
                body: (body) => {
                    if (body == null) {
                        return;
                    }
                    const nodePathForRequestBody = [...nodePathForRequest, "body"];

                    if (typeof body === "string") {
                        visitTypeReference(body, nodePathForRequestBody, {
                            location: "requestReference"
                        });
                    } else if (isInlineRequestBody(body)) {
                        visitor.typeDeclaration?.(
                            { typeName: { isInlined: true, location: "inlinedRequest" }, declaration: body },
                            nodePathForRequestBody
                        );

                        visitObject(body, {
                            extends: (_extends) => {
                                if (_extends == null) {
                                    return;
                                }
                                const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                                for (const extendedType of extendsList) {
                                    const nodePathForExtension = [...nodePathForRequestBody, "extends", extendedType];
                                    visitor.extension?.(extendedType, nodePathForExtension);
                                    visitTypeReference(extendedType, nodePathForExtension);
                                }
                            },
                            properties: (properties) => {
                                if (properties == null) {
                                    return;
                                }
                                for (const [propertyKey, property] of Object.entries(properties)) {
                                    const nodePathForProperty = [...nodePathForRequestBody, "properties", propertyKey];
                                    if (typeof property === "string") {
                                        visitTypeReference(property, nodePathForProperty, {
                                            location: TypeReferenceLocation.InlinedRequestProperty
                                        });
                                    } else {
                                        visitObject(property, {
                                            name: noop,
                                            docs: createDocsVisitor(visitor, nodePathForProperty),
                                            availability: noop,
                                            type: (type) => {
                                                visitTypeReference(type, [...nodePathForProperty, "type"], {
                                                    location: TypeReferenceLocation.InlinedRequestProperty,
                                                    _default: property.default,
                                                    validation: property.validation
                                                });
                                            },
                                            "content-type": noop,
                                            audiences: noop,
                                            encoding: noop,
                                            default: noop,
                                            validation: noop
                                        });
                                    }
                                }
                            },
                            ["extra-properties"]: noop
                        });
                    } else {
                        createDocsVisitor(visitor, nodePathForRequestBody)(body.docs);
                        visitTypeReference(body.type, nodePathForRequestBody);
                    }
                }
            });
        },
        audiences: noop,
        method: noop,
        auth: noop,
        "stream-condition": (streamCondition) => {
            visitor.streamCondition?.({ streamCondition, endpoint }, [...nodePathForEndpoint, "stream-condition"]);
        },
        "response-stream": (responseStream) => {
            if (responseStream == null) {
                return;
            }
            if (typeof responseStream === "string") {
                visitTypeReference(responseStream, [...nodePathForEndpoint, "response-stream"], {
                    location: TypeReferenceLocation.StreamingResponse
                });
            } else {
                visitTypeReference(responseStream.type, [...nodePathForEndpoint, "response-stream"], {
                    location: TypeReferenceLocation.StreamingResponse
                });
            }
        },
        response: (response) => {
            if (response == null) {
                return;
            }
            const nodePathForResponse = [...nodePathForEndpoint, "response"];
            if (typeof response === "string") {
                visitTypeReference(response, nodePathForResponse, { location: TypeReferenceLocation.Response });
            } else {
                visitObject(response, {
                    docs: createDocsVisitor(visitor, nodePathForResponse),
                    type: (type) => {
                        visitTypeReference(type, [...nodePathForResponse, "type"], {
                            location: TypeReferenceLocation.Response
                        });
                    },
                    property: noop,
                    "status-code": noop
                });
            }
        },
        errors: (errors) => {
            if (errors == null) {
                return;
            }
            for (const error of errors) {
                const nodePathForError = [
                    ...nodePathForEndpoint,
                    "errors",
                    typeof error === "string" ? error : error.error
                ];
                if (typeof error === "string") {
                    visitor.errorReference?.(error, nodePathForError);
                } else {
                    visitObject(error, {
                        docs: createDocsVisitor(visitor, nodePathForError),
                        error: (error) => {
                            visitor.errorReference?.(error, [...nodePathForError, "error"]);
                        }
                    });
                }
            }
        },
        examples: (examples) => {
            if (examples == null) {
                return;
            }
            for (const [index, example] of examples.entries()) {
                visitExampleEndpointCall({
                    nodePathForExample: [...nodePathForEndpoint, { key: "examples", arrayIndex: index }],
                    visitor,
                    service,
                    endpoint,
                    example
                });
            }
        },
        pagination: noop,
        source: noop,
        transport: noop
    });
}

function visitExampleEndpointCall({
    nodePathForExample,
    visitor,
    service,
    endpoint,
    example
}: {
    nodePathForExample: NodePath;
    visitor: Partial<DefinitionFileAstVisitor>;
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
}): void {
    // if an example is entirely empty and has code samples, dont validate against the
    // request or response schemas
    if (
        example.headers == null &&
        example["path-parameters"] == null &&
        example["query-parameters"] == null &&
        example.request == null &&
        example.response == null &&
        example["code-samples"] != null
    ) {
        return;
    }

    visitor.exampleHttpEndpointCall?.(
        {
            service,
            endpoint,
            example
        },
        nodePathForExample
    );

    const nodePathForHeaders = [...nodePathForExample, "headers"];
    visitor.exampleHeaders?.(
        {
            service,
            endpoint,
            examples: example.headers
        },
        nodePathForHeaders
    );
    if (example.headers != null) {
        for (const exampleHeader of Object.values(example.headers)) {
            visitAllReferencesInExample({
                example: exampleHeader,
                visitor,
                nodePath: nodePathForHeaders
            });
        }
    }

    const nodePathForPathParameters = [...nodePathForExample, "path-parameters"];
    visitor.examplePathParameters?.(
        {
            service,
            endpoint,
            examples: example["path-parameters"]
        },
        nodePathForPathParameters
    );
    if (example["path-parameters"] != null) {
        for (const examplePathParameter of Object.values(example["path-parameters"])) {
            visitAllReferencesInExample({
                example: examplePathParameter,
                visitor,
                nodePath: nodePathForPathParameters
            });
        }
    }

    const nodePathForQueryParameters = [...nodePathForExample, "query-parameters"];
    visitor.exampleQueryParameters?.(
        {
            service,
            endpoint,
            examples: example["query-parameters"]
        },
        nodePathForQueryParameters
    );
    if (example["query-parameters"] != null) {
        for (const exampleQueryParameter of Object.values(example["query-parameters"])) {
            visitAllReferencesInExample({
                example: exampleQueryParameter,
                visitor,
                nodePath: nodePathForQueryParameters
            });
        }
    }

    const nodePathForRequest = [...nodePathForExample, "request"];
    visitor.exampleRequest?.(
        {
            service,
            endpoint,
            example: example.request
        },
        nodePathForRequest
    );
    if (example.request != null) {
        visitAllReferencesInExample({
            example: example.request,
            visitor,
            nodePath: nodePathForRequest
        });
    }

    const nodePathForResponse = [...nodePathForExample, "response"];
    visitor.exampleResponse?.(
        {
            service,
            endpoint,
            example: example.response
        },
        nodePathForResponse
    );
    if (example.response != null) {
        visitExampleResponseSchema(endpoint, example.response, {
            body: (response) => {
                if (response.body != null) {
                    visitAllReferencesInExample({
                        example: response.body,
                        visitor,
                        nodePath: nodePathForResponse
                    });
                }
                if (response.error != null) {
                    visitor.errorReference?.(response.error, [...nodePathForResponse, "error"]);
                }
            },
            stream: (response) => {
                for (const example of response.stream) {
                    visitAllReferencesInExample({
                        example,
                        visitor,
                        nodePath: nodePathForResponse
                    });
                }
            },
            events: (response) => {
                for (const { data: example } of response.stream) {
                    visitAllReferencesInExample({
                        example,
                        visitor,
                        nodePath: nodePathForResponse
                    });
                }
            }
        });
    }

    if (example["code-samples"] != null) {
        for (const [index, codeSample] of example["code-samples"].entries()) {
            visitor.exampleCodeSample?.(
                {
                    service,
                    endpoint,
                    example,
                    sample: codeSample
                },
                [...nodePathForExample, { key: "code-samples", arrayIndex: index }]
            );
        }
    }
}

export function visitPathParameters({
    pathParameters,
    visitor,
    nodePath
}: {
    pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor> | Partial<RootApiFileAstVisitor>;
    nodePath: NodePath;
}): void {
    if (pathParameters == null) {
        return;
    }
    const visitTypeReference = createTypeReferenceVisitor(visitor);
    for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
        const nodePathForPathParameter = [...nodePath, pathParameterKey];

        visitor.pathParameter?.({ pathParameterKey, pathParameter }, nodePathForPathParameter);

        if (isVariablePathParameter(pathParameter)) {
            if (typeof pathParameter === "string") {
                visitor.variableReference?.(pathParameter, nodePathForPathParameter);
            } else {
                visitObject(pathParameter, {
                    docs: createDocsVisitor(visitor, nodePathForPathParameter),
                    variable: (variable) =>
                        visitor.variableReference?.(variable, [...nodePathForPathParameter, "variable"]),
                    availability: noop
                });
            }
        } else {
            if (typeof pathParameter === "string") {
                visitTypeReference(pathParameter, nodePathForPathParameter);
            } else {
                visitObject(pathParameter, {
                    docs: createDocsVisitor(visitor, nodePathForPathParameter),
                    type: (type) => {
                        visitTypeReference(type, [...nodePathForPathParameter, "type"], {
                            _default: pathParameter.default,
                            validation: pathParameter.validation
                        });
                    },
                    availability: noop,
                    encoding: noop,
                    default: noop,
                    validation: noop,
                    name: noop,
                    audiences: noop
                });
            }
        }
    }
}

function visitHeaders({
    headers,
    visitor,
    nodePath
}: {
    headers: Record<string, RawSchemas.HttpHeaderSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (headers == null) {
        return;
    }

    const visitTypeReference = createTypeReferenceVisitor(visitor);

    for (const [headerKey, header] of Object.entries(headers)) {
        const nodePathForHeader = [...nodePath, headerKey];

        visitor.header?.({ headerKey, header }, nodePathForHeader);

        if (typeof header === "string") {
            visitTypeReference(header, nodePathForHeader);
        } else {
            visitObject(header, {
                name: noop,
                availability: noop,
                type: (type) => {
                    visitTypeReference(type, nodePathForHeader, {
                        _default: header.default,
                        validation: header.validation
                    });
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
                encoding: noop,
                env: noop,
                default: noop,
                validation: noop
            });
        }
    }
}
