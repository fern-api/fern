import { HttpEndpointSchema, HttpServiceSchema } from "@fern-api/yaml-schema/src/schemas";
import { FernAstVisitor } from "../../FernAstVisitor";
import { NodePath } from "../../NodePath";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { noop } from "../utils/noop";
import { visitObject } from "../utils/ObjectPropertiesVisitor";

export function visitHttpService({
    service,
    visitor,
    nodePathForService,
}: {
    service: HttpServiceSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForService: NodePath;
}): void {
    visitObject(service, {
        "base-path": noop,
        docs: createDocsVisitor(visitor, nodePathForService),
        headers: (headers) => {
            if (headers == null) {
                return;
            }
            for (const [headerKey, header] of Object.entries(headers)) {
                const nodePathForHeader = [...nodePathForService, "headers", headerKey];
                if (typeof header === "string") {
                    visitor.typeReference?.(header, nodePathForHeader);
                } else {
                    visitObject(header, {
                        type: (type) => {
                            visitor.typeReference?.(type, nodePathForHeader);
                        },
                        docs: createDocsVisitor(visitor, nodePathForHeader),
                    });
                }
            }
        },
        auth: noop,
        endpoints: (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                const nodePathForEndpoint = [...nodePathForService, "endpoints", endpointId];
                visitor.httpEndpoint?.({ endpointId, endpoint }, nodePathForEndpoint);
                visitEndpoint({ endpoint, visitor, nodePathForEndpoint });
            }
        },
    });
}

function visitEndpoint({
    endpoint,
    visitor,
    nodePathForEndpoint,
}: {
    endpoint: HttpEndpointSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForEndpoint: NodePath;
}) {
    visitObject(endpoint, {
        docs: createDocsVisitor(visitor, nodePathForEndpoint),
        path: noop,
        "path-parameters": (pathParameters) => {
            if (pathParameters == null) {
                return;
            }
            for (const [pathParameterKey, pathParameter] of Object.entries(pathParameters)) {
                const nodePathForPathParameter = [...nodePathForEndpoint, "path-parameters", pathParameterKey];
                if (typeof pathParameter === "string") {
                    visitor.typeReference?.(pathParameter, nodePathForPathParameter);
                } else {
                    visitObject(pathParameter, {
                        docs: createDocsVisitor(visitor, nodePathForPathParameter),
                        type: (type) => {
                            visitor.typeReference?.(type, [...nodePathForPathParameter, "type"]);
                        },
                    });
                }
            }
        },
        "query-parameters": (queryParameters) => {
            if (queryParameters == null) {
                return;
            }
            for (const [queryParameterKey, queryParameter] of Object.entries(queryParameters)) {
                const nodePathForQueryParameter = [...nodePathForEndpoint, "query", queryParameterKey];
                if (typeof queryParameter === "string") {
                    visitor.typeReference?.(queryParameter, nodePathForQueryParameter);
                } else {
                    visitObject(queryParameter, {
                        docs: createDocsVisitor(visitor, nodePathForQueryParameter),
                        type: (type) => {
                            visitor.typeReference?.(type, [...nodePathForQueryParameter, "type"]);
                        },
                    });
                }
            }
        },
        method: noop,
        "auth-override": noop,
        headers: noop,
        request: (request) => {
            if (request == null) {
                return;
            }
            const nodePathForRequest = [...nodePathForEndpoint, "request"];
            if (typeof request === "string") {
                visitor.typeReference?.(request, nodePathForRequest);
            } else {
                visitObject(request, {
                    docs: createDocsVisitor(visitor, nodePathForRequest),
                    type: (type) => visitor.typeReference?.(type, [...nodePathForRequest, "type"]),
                    encoding: noop,
                });
            }
        },
        response: (response) => {
            if (response == null) {
                return;
            }
            const nodePathForResponse = [...nodePathForEndpoint, "response"];
            if (typeof response === "string") {
                visitor.typeReference?.(response, nodePathForResponse);
            } else {
                visitObject(response, {
                    docs: createDocsVisitor(visitor, nodePathForResponse),
                    type: (type) => {
                        visitor.typeReference?.(type, [...nodePathForResponse, "type"]);
                    },
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
                    typeof error === "string" ? error : error.error,
                ];
                if (typeof error === "string") {
                    visitor.errorReference?.(error, nodePathForError);
                } else {
                    visitObject(error, {
                        docs: createDocsVisitor(visitor, nodePathForError),
                        error: (error) => {
                            visitor.errorReference?.(error, [...nodePathForError, "error"]);
                        },
                    });
                }
            }
        },
    });
}
