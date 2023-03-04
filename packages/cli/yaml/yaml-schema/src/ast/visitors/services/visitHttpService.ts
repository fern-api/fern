import { noop, visitObject } from "@fern-api/core-utils";
import { RawSchemas } from "../../..";
import { HttpEndpointSchema, HttpHeaderSchema, HttpPathParameterSchema, HttpServiceSchema } from "../../../schemas";
import { isInlineRequestBody } from "../../../utils/isInlineRequestBody";
import { FernServiceFileAstVisitor } from "../../FernServiceFileAstVisitor";
import { NodePath } from "../../NodePath";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { visitAllReferencesInExample } from "../utils/visitAllReferencesInExample";

export async function visitHttpService({
    service,
    visitor,
    nodePath,
}: {
    service: HttpServiceSchema;
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    await visitor.httpService?.(service, nodePath);

    await visitObject(service, {
        url: noop,
        "base-path": noop,
        "display-name": noop,
        docs: createDocsVisitor(visitor, nodePath),
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
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePathForEndpoint: NodePath;
}) {
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
                await visitor.typeReference?.(request, nodePathForRequest);
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
                            await visitor.typeReference?.(queryParameter, nodePathForQueryParameter);
                        } else {
                            await visitObject(queryParameter, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForQueryParameter),
                                availability: noop,
                                type: async (type) => {
                                    await visitor.typeReference?.(type, [...nodePathForQueryParameter, "type"]);
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
                        await visitor.typeReference?.(body, nodePathForRequestBody);
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
                                    await visitor.typeReference?.(extendedType, [...nodePathForRequestBody, "extends"]);
                                }
                            },
                            properties: async (properties) => {
                                if (properties == null) {
                                    return;
                                }
                                for (const [propertyKey, property] of Object.entries(properties)) {
                                    const nodePathForProperty = [...nodePathForRequestBody, "properties", propertyKey];
                                    if (typeof property === "string") {
                                        await visitor.typeReference?.(property, nodePathForProperty);
                                    } else {
                                        await visitObject(property, {
                                            name: noop,
                                            docs: createDocsVisitor(visitor, nodePathForProperty),
                                            availability: noop,
                                            type: async (type) => {
                                                await visitor.typeReference?.(type, [...nodePathForProperty, "type"]);
                                            },
                                            audiences: noop,
                                        });
                                    }
                                }
                            },
                        });
                    } else {
                        await createDocsVisitor(visitor, nodePathForRequestBody)(body.docs);
                        await visitor.typeReference?.(body.type, nodePathForRequestBody);
                    }
                },
            });
        },
        audiences: noop,
        method: noop,
        auth: noop,
        response: async (response) => {
            if (response == null) {
                return;
            }
            const nodePathForResponse = [...nodePathForEndpoint, "response"];
            if (typeof response === "string") {
                await visitor.typeReference?.(response, nodePathForResponse);
            } else {
                await visitObject(response, {
                    docs: createDocsVisitor(visitor, nodePathForResponse),
                    type: async (type) => {
                        await visitor.typeReference?.(type, [...nodePathForResponse, "type"]);
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
    visitor: Partial<FernServiceFileAstVisitor>;
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
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (pathParameters == null) {
        return;
    }
    for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
        const nodePathForPathParameter = [...nodePath, pathParameterKey];

        await visitor.pathParameter?.({ pathParameterKey, pathParameter }, nodePathForPathParameter);

        if (typeof pathParameter === "string") {
            await visitor.typeReference?.(pathParameter, nodePathForPathParameter);
        } else {
            await visitObject(pathParameter, {
                docs: createDocsVisitor(visitor, nodePathForPathParameter),
                availability: noop,
                type: async (type) => {
                    await visitor.typeReference?.(type, [...nodePathForPathParameter, "type"]);
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
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (headers == null) {
        return;
    }
    for (const [headerKey, header] of Object.entries(headers)) {
        const nodePathForHeader = [...nodePath, headerKey];

        await visitor.header?.({ headerKey, header }, nodePathForHeader);

        if (typeof header === "string") {
            await visitor.typeReference?.(header, nodePathForHeader);
        } else {
            await visitObject(header, {
                name: noop,
                availability: noop,
                type: async (type) => {
                    await visitor.typeReference?.(type, nodePathForHeader);
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
            });
        }
    }
}
