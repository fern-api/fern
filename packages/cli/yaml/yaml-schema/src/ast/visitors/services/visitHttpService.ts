import { noop, visitObject } from "@fern-api/core-utils";
import { HttpEndpointSchema, HttpHeaderSchema, HttpPathParameterSchema, HttpServiceSchema } from "../../../schemas";
import { isInlineRequestBody } from "../../../utils/isInlineRequestBody";
import { FernServiceFileAstVisitor } from "../../FernServiceFileAstVisitor";
import { NodePath } from "../../NodePath";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { visitTypeDeclaration } from "../visitTypeDeclarations";

export async function visitHttpService({
    service,
    visitor,
    nodePathForService,
}: {
    service: HttpServiceSchema;
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePathForService: NodePath;
}): Promise<void> {
    await visitObject(service, {
        "base-path": noop,
        docs: createDocsVisitor(visitor, nodePathForService),
        availability: noop,
        headers: async (headers) => {
            await visitHeaders({
                headers,
                visitor,
                nodePath: [...nodePathForService, "headers"],
            });
        },
        audiences: noop,
        auth: noop,
        "path-parameters": async (pathParameters) => {
            await visitPathParameters({
                pathParameters,
                visitor,
                nodePath: [...nodePathForService, "path-parameters"],
            });
        },
        endpoints: async (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                const nodePathForEndpoint = [...nodePathForService, "endpoints", endpointId];
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
                        await visitTypeDeclaration({
                            typeName: "<Inlined Request>",
                            declaration: body,
                            visitor,
                            nodePathForType: nodePathForRequestBody,
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
                const nodePathForExample: NodePath = [...nodePathForEndpoint, { key: "examples", arrayIndex: index }];
                await visitor.exampleHttpEndpointCall?.(
                    {
                        service,
                        endpoint,
                        example,
                    },
                    nodePathForExample
                );
                await visitor.exampleHeaders?.(
                    {
                        service,
                        endpoint,
                        examples: example.headers,
                    },
                    [...nodePathForExample, "headers"]
                );
                await visitor.examplePathParameters?.(
                    {
                        service,
                        endpoint,
                        examples: example["path-parameters"],
                    },
                    [...nodePathForExample, "path-parameters"]
                );
                await visitor.exampleQueryParameters?.(
                    {
                        service,
                        endpoint,
                        examples: example["query-parameters"],
                    },
                    [...nodePathForExample, "query-parameters"]
                );
                await visitor.exampleRequest?.(
                    {
                        service,
                        endpoint,
                        example: example.request,
                    },
                    [...nodePathForExample, "request"]
                );
                await visitor.exampleResponse?.(
                    {
                        service,
                        endpoint,
                        example: example.response,
                    },
                    [...nodePathForExample, "response"]
                );

                if (example.response != null) {
                    const nodePathForResponse = [...nodePathForExample, "response"];
                    if (example.response.error != null) {
                        await visitor.errorReference?.(example.response.error, [...nodePathForResponse, "error"]);
                    }
                }
            }
        },
    });
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
