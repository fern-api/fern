import { noop, visitObject } from "@fern-api/core-utils";
import { RawSchemas } from "../../..";
import { HttpEndpointSchema, HttpHeaderSchema, HttpPathParameterSchema, HttpServiceSchema } from "../../../schemas";
import { isInlineRequestBody } from "../../../utils/isInlineRequestBody";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../../DefinitionFileAstVisitor";
import { NodePath } from "../../NodePath";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { visitAllReferencesInExample } from "../utils/visitAllReferencesInExample";
import { createTypeReferenceVisitor } from "../utils/visitTypeReference";

export async function visitHttpService({
    service,
    visitor,
    nodePath,
}: {
    service: HttpServiceSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    await visitor.httpService?.(service, nodePath);

    await visitObject(service, {
        url: noop,
        "base-path": noop,
        "display-name": noop,
        availability: noop,
        headers: async (headers) => {
            await visitHeaders({
                headers,
                visitor,
                nodePath: [...nodePath, "headers"],
            });
        },
        audiences: noop,
        auth: noop,
        "path-parameters": async (pathParameters) => {
            await visitPathParameters({
                pathParameters,
                visitor,
                nodePath: [...nodePath, "path-parameters"],
            });
        },
        endpoints: async (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                const nodePathForEndpoint = [...nodePath, "endpoints", endpointId];
                await visitEndpoint({ endpointId, endpoint, service, visitor, nodePathForEndpoint });
            }
        },
    });
}

async function visitEndpoint({
    endpointId,
    endpoint,
    service,
    visitor,
    nodePathForEndpoint,
}: {
    endpointId: string;
    endpoint: HttpEndpointSchema;
    service: HttpServiceSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForEndpoint: NodePath;
}) {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    await visitor.httpEndpoint?.({ endpointId, endpoint, service }, nodePathForEndpoint);
    await visitObject(endpoint, {
        docs: createDocsVisitor(visitor, nodePathForEndpoint),
        "display-name": noop,
        availability: noop,
        path: noop,
        "path-parameters": async (pathParameters) => {
            await visitPathParameters({
                pathParameters,
                visitor,
                nodePath: [...nodePathForEndpoint, "path-parameters"],
            });
        },
        request: async (request) => {
            if (request == null) {
                return;
            }
            const nodePathForRequest = [...nodePathForEndpoint, "request"];
            if (typeof request === "string") {
                await visitTypeReference(request, nodePathForRequest);
                return;
            }
            await visitObject(request, {
                name: noop,
                "query-parameters": async (queryParameters) => {
                    if (queryParameters == null) {
                        return;
                    }
                    for (const [queryParameterKey, queryParameter] of Object.entries(queryParameters)) {
                        const nodePathForQueryParameter = [
                            ...nodePathForRequest,
                            "query-parameters",
                            queryParameterKey,
                        ];
                        await visitor.queryParameter?.(
                            { queryParameterKey, queryParameter },
                            nodePathForQueryParameter
                        );

                        if (typeof queryParameter === "string") {
                            await visitTypeReference(queryParameter, nodePathForQueryParameter);
                        } else {
                            await visitObject(queryParameter, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForQueryParameter),
                                availability: noop,
                                type: async (type) => {
                                    await visitTypeReference(type, [...nodePathForQueryParameter, "type"]);
                                },
                                "allow-multiple": noop,
                                audiences: noop,
                            });
                        }
                    }
                },
                headers: async (headers) => {
                    await visitHeaders({
                        headers,
                        visitor,
                        nodePath: [...nodePathForRequest, "headers"],
                    });
                },
                body: async (body) => {
                    if (body == null) {
                        return;
                    }
                    const nodePathForRequestBody = [...nodePathForRequest, "body"];

                    if (typeof body === "string") {
                        await visitTypeReference(body, nodePathForRequestBody);
                    } else if (isInlineRequestBody(body)) {
                        await visitor.typeDeclaration?.(
                            { typeName: { isInlined: true, location: "inlinedRequest" }, declaration: body },
                            nodePathForRequestBody
                        );

                        await visitObject(body, {
                            extends: async (_extends) => {
                                if (_extends == null) {
                                    return;
                                }
                                const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                                for (const extendedType of extendsList) {
                                    await visitTypeReference(extendedType, [...nodePathForRequestBody, "extends"]);
                                }
                            },
                            properties: async (properties) => {
                                if (properties == null) {
                                    return;
                                }
                                for (const [propertyKey, property] of Object.entries(properties)) {
                                    const nodePathForProperty = [...nodePathForRequestBody, "properties", propertyKey];
                                    if (typeof property === "string") {
                                        await visitTypeReference(property, nodePathForProperty, {
                                            location: TypeReferenceLocation.InlinedRequestProperty,
                                        });
                                    } else {
                                        await visitObject(property, {
                                            name: noop,
                                            docs: createDocsVisitor(visitor, nodePathForProperty),
                                            availability: noop,
                                            type: async (type) => {
                                                await visitTypeReference(type, [...nodePathForProperty, "type"], {
                                                    location: TypeReferenceLocation.InlinedRequestProperty,
                                                });
                                            },
                                            audiences: noop,
                                        });
                                    }
                                }
                            },
                        });
                    } else {
                        await createDocsVisitor(visitor, nodePathForRequestBody)(body.docs);
                        await visitTypeReference(body.type, nodePathForRequestBody);
                    }
                },
            });
        },
        audiences: noop,
        method: noop,
        auth: noop,
        "stream-condition": async (streamCondition) => {
            await visitor.streamCondition?.({ streamCondition, endpoint }, [
                ...nodePathForEndpoint,
                "stream-condition",
            ]);
        },
        "response-stream": async (responseStream) => {
            if (responseStream == null) {
                return;
            }
            await visitTypeReference(responseStream.data, [...nodePathForEndpoint, "response-stream"]);
        },
        response: async (response) => {
            if (response == null) {
                return;
            }
            const nodePathForResponse = [...nodePathForEndpoint, "response"];
            if (typeof response === "string") {
                await visitTypeReference(response, nodePathForResponse);
            } else {
                await visitObject(response, {
                    docs: createDocsVisitor(visitor, nodePathForResponse),
                    type: async (type) => {
                        await visitTypeReference(type, [...nodePathForResponse, "type"]);
                    },
                });
            }
        },
        errors: async (errors) => {
            if (errors == null) {
                return;
            }
            for (const error of errors) {
                const nodePathForError = [
                    ...nodePathForEndpoint,
                    "errors",
                    typeof error === "string" ? error : error.error,
                ];
                if (typeof error === "string") {
                    await visitor.errorReference?.(error, nodePathForError);
                } else {
                    await visitObject(error, {
                        docs: createDocsVisitor(visitor, nodePathForError),
                        error: async (error) => {
                            await visitor.errorReference?.(error, [...nodePathForError, "error"]);
                        },
                    });
                }
            }
        },
        examples: async (examples) => {
            if (examples == null) {
                return;
            }
            for (const [index, example] of examples.entries()) {
                await visitExampleEndpointCall({
                    nodePathForExample: [...nodePathForEndpoint, { key: "examples", arrayIndex: index }],
                    visitor,
                    service,
                    endpoint,
                    example,
                });
            }
        },
    });
}

async function visitExampleEndpointCall({
    nodePathForExample,
    visitor,
    service,
    endpoint,
    example,
}: {
    nodePathForExample: NodePath;
    visitor: Partial<DefinitionFileAstVisitor>;
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
}): Promise<void> {
    await visitor.exampleHttpEndpointCall?.(
        {
            service,
            endpoint,
            example,
        },
        nodePathForExample
    );

    const nodePathForHeaders = [...nodePathForExample, "headers"];
    await visitor.exampleHeaders?.(
        {
            service,
            endpoint,
            examples: example.headers,
        },
        nodePathForHeaders
    );
    if (example.headers != null) {
        for (const exampleHeader of Object.values(example.headers)) {
            await visitAllReferencesInExample({
                example: exampleHeader,
                visitor,
                nodePath: nodePathForHeaders,
            });
        }
    }

    const nodePathForPathParameters = [...nodePathForExample, "path-parameters"];
    await visitor.examplePathParameters?.(
        {
            service,
            endpoint,
            examples: example["path-parameters"],
        },
        nodePathForPathParameters
    );
    if (example["path-parameters"] != null) {
        for (const examplePathParameter of Object.values(example["path-parameters"])) {
            await visitAllReferencesInExample({
                example: examplePathParameter,
                visitor,
                nodePath: nodePathForPathParameters,
            });
        }
    }

    const nodePathForQueryParameters = [...nodePathForExample, "query-parameters"];
    await visitor.exampleQueryParameters?.(
        {
            service,
            endpoint,
            examples: example["query-parameters"],
        },
        nodePathForQueryParameters
    );
    if (example["query-parameters"] != null) {
        for (const exampleQueryParameter of Object.values(example["query-parameters"])) {
            await visitAllReferencesInExample({
                example: exampleQueryParameter,
                visitor,
                nodePath: nodePathForQueryParameters,
            });
        }
    }

    const nodePathForRequest = [...nodePathForExample, "request"];
    await visitor.exampleRequest?.(
        {
            service,
            endpoint,
            example: example.request,
        },
        nodePathForRequest
    );
    if (example.request != null) {
        await visitAllReferencesInExample({
            example: example.request,
            visitor,
            nodePath: nodePathForRequest,
        });
    }

    const nodePathForResponse = [...nodePathForExample, "response"];
    await visitor.exampleResponse?.(
        {
            service,
            endpoint,
            example: example.response,
        },
        nodePathForResponse
    );
    if (example.response != null) {
        if (example.response.body != null) {
            await visitAllReferencesInExample({
                example: example.response.body,
                visitor,
                nodePath: nodePathForResponse,
            });
        }
        if (example.response.error != null) {
            await visitor.errorReference?.(example.response.error, [...nodePathForResponse, "error"]);
        }
    }
}

async function visitPathParameters({
    pathParameters,
    visitor,
    nodePath,
}: {
    pathParameters: Record<string, HttpPathParameterSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (pathParameters == null) {
        return;
    }
    const visitTypeReference = createTypeReferenceVisitor(visitor);
    for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
        const nodePathForPathParameter = [...nodePath, pathParameterKey];

        await visitor.pathParameter?.({ pathParameterKey, pathParameter }, nodePathForPathParameter);

        if (typeof pathParameter === "string") {
            await visitTypeReference(pathParameter, nodePathForPathParameter);
        } else {
            await visitObject(pathParameter, {
                docs: createDocsVisitor(visitor, nodePathForPathParameter),
                availability: noop,
                type: async (type) => {
                    await visitTypeReference(type, [...nodePathForPathParameter, "type"]);
                },
                audiences: noop,
            });
        }
    }
}

async function visitHeaders({
    headers,
    visitor,
    nodePath,
}: {
    headers: Record<string, HttpHeaderSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (headers == null) {
        return;
    }

    const visitTypeReference = createTypeReferenceVisitor(visitor);

    for (const [headerKey, header] of Object.entries(headers)) {
        const nodePathForHeader = [...nodePath, headerKey];

        await visitor.header?.({ headerKey, header }, nodePathForHeader);

        if (typeof header === "string") {
            await visitTypeReference(header, nodePathForHeader);
        } else {
            await visitObject(header, {
                name: noop,
                availability: noop,
                type: async (type) => {
                    await visitTypeReference(type, nodePathForHeader);
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
            });
        }
    }
}
