import { noop, visitObject } from "@fern-api/core-utils";
import { HttpEndpointSchema, HttpServiceSchema } from "../../../schemas";
import { FernAstVisitor } from "../../FernAstVisitor";
import { NodePath } from "../../NodePath";
import { createDocsVisitor } from "../utils/createDocsVisitor";

export async function visitHttpService({
    service,
    visitor,
    nodePathForService,
}: {
    service: HttpServiceSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForService: NodePath;
}): Promise<void> {
    await visitObject(service, {
        "base-path": noop,
        docs: createDocsVisitor(visitor, nodePathForService),
        headers: async (headers) => {
            if (headers == null) {
                return;
            }
            for (const [headerKey, header] of Object.entries(headers)) {
                const nodePathForHeader = [...nodePathForService, "headers", headerKey];
                if (typeof header === "string") {
                    await visitor.typeReference?.(header, nodePathForHeader);
                } else {
                    await visitObject(header, {
                        name: noop,
                        type: async (type) => {
                            await visitor.typeReference?.(type, nodePathForHeader);
                        },
                        docs: createDocsVisitor(visitor, nodePathForHeader),
                    });
                }
            }
        },
        auth: noop,
        "path-parameters": async (pathParameters) => {
            if (pathParameters == null) {
                return;
            }
            for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
                const nodePathForPathParameter = [...nodePathForService, "path-parameters", pathParameterKey];
                if (typeof pathParameter === "string") {
                    await visitor.typeReference?.(pathParameter, nodePathForPathParameter);
                } else {
                    await visitObject(pathParameter, {
                        type: async (type) => {
                            await visitor.typeReference?.(type, nodePathForPathParameter);
                        },
                        docs: createDocsVisitor(visitor, nodePathForPathParameter),
                    });
                }
            }
        },
        endpoints: async (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                const nodePathForEndpoint = [...nodePathForService, "endpoints", endpointId];
                await visitor.httpEndpoint?.({ endpointId, endpoint }, nodePathForEndpoint);
                await visitEndpoint({ endpoint, visitor, nodePathForEndpoint });
            }
        },
    });
}

async function visitEndpoint({
    endpoint,
    visitor,
    nodePathForEndpoint,
}: {
    endpoint: HttpEndpointSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForEndpoint: NodePath;
}) {
    await visitObject(endpoint, {
        docs: createDocsVisitor(visitor, nodePathForEndpoint),
        path: noop,
        "path-parameters": async (pathParameters) => {
            if (pathParameters == null) {
                return;
            }
            for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
                const nodePathForPathParameter = [...nodePathForEndpoint, "path-parameters", pathParameterKey];
                if (typeof pathParameter === "string") {
                    await visitor.typeReference?.(pathParameter, nodePathForPathParameter);
                } else {
                    await visitObject(pathParameter, {
                        docs: createDocsVisitor(visitor, nodePathForPathParameter),
                        type: async (type) => {
                            await visitor.typeReference?.(type, [...nodePathForPathParameter, "type"]);
                        },
                    });
                }
            }
        },
        "query-parameters": async (queryParameters) => {
            if (queryParameters == null) {
                return;
            }
            for (const [queryParameterKey, queryParameter] of Object.entries(queryParameters)) {
                const nodePathForQueryParameter = [...nodePathForEndpoint, "query", queryParameterKey];
                if (typeof queryParameter === "string") {
                    await visitor.typeReference?.(queryParameter, nodePathForQueryParameter);
                } else {
                    await visitObject(queryParameter, {
                        name: noop,
                        docs: createDocsVisitor(visitor, nodePathForQueryParameter),
                        type: async (type) => {
                            await visitor.typeReference?.(type, [...nodePathForQueryParameter, "type"]);
                        },
                    });
                }
            }
        },
        method: noop,
        auth: noop,
        headers: noop,
        request: async (request) => {
            if (request == null) {
                return;
            }
            const nodePathForRequest = [...nodePathForEndpoint, "request"];
            if (typeof request === "string") {
                await visitor.typeReference?.(request, nodePathForRequest);
            } else {
                await visitObject(request, {
                    docs: createDocsVisitor(visitor, nodePathForRequest),
                    type: async (type) => {
                        await visitor.typeReference?.(type, [...nodePathForRequest, "type"]);
                    },
                    encoding: noop,
                });
            }
        },
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
    });
}
