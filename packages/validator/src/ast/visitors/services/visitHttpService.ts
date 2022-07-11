import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpServiceSchema } from "@fern-api/yaml-schema/src/schemas";
import { FernAstVisitor } from "../../AstVisitor";
import { createDocsVisitor } from "../utils/createDocsVisitor";
import { noop } from "../utils/noop";
import { visitObject } from "../utils/ObjectPropertiesVisitor";

export function visitHttpService({ service, visitor }: { service: HttpServiceSchema; visitor: FernAstVisitor }): void {
    visitObject(service, {
        "base-path": noop,
        docs: createDocsVisitor(visitor),
        headers: (headers) => {
            if (headers == null) {
                return;
            }
            for (const header of Object.values(headers)) {
                if (typeof header === "string") {
                    visitor.typeReference(header);
                } else {
                    visitObject(header, {
                        type: (type) => {
                            if (type != null) {
                                visitor.typeReference(type);
                            }
                        },
                        docs: createDocsVisitor(visitor),
                    });
                }
            }
        },
        auth: noop,
        endpoints: (endpoints) => {
            for (const [endpointId, endpoint] of Object.entries(endpoints)) {
                visitor.httpEndpoint({ endpointId, endpoint });
                visitEndpoint({ endpoint, visitor });
            }
        },
    });
}

function visitEndpoint({ endpoint, visitor }: { endpoint: RawSchemas.HttpEndpointSchema; visitor: FernAstVisitor }) {
    visitObject(endpoint, {
        docs: createDocsVisitor(visitor),
        path: noop,
        "path-parameters": (pathParameters) => {
            if (pathParameters == null) {
                return;
            }
            for (const pathParameter of Object.values(pathParameters)) {
                if (typeof pathParameter === "string") {
                    visitor.typeReference(pathParameter);
                } else {
                    visitObject(pathParameter, {
                        docs: createDocsVisitor(visitor),
                        type: (type) => {
                            if (type != null) {
                                visitor.typeReference(type);
                            }
                        },
                    });
                }
            }
        },
        "query-parameters": (queryParameters) => {
            if (queryParameters == null) {
                return;
            }
            for (const queryParameter of Object.values(queryParameters)) {
                if (typeof queryParameter === "string") {
                    visitor.typeReference(queryParameter);
                } else {
                    visitObject(queryParameter, {
                        docs: createDocsVisitor(visitor),
                        type: (type) => {
                            if (type != null) {
                                visitor.typeReference(type);
                            }
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
            if (typeof request === "string") {
                visitor.typeReference(request);
            } else {
                visitObject(request, {
                    docs: createDocsVisitor(visitor),
                    type: (type) => visitor.typeReference(type),
                    encoding: noop,
                });
            }
        },
        response: (response) => {
            if (response == null) {
                return;
            }
            if (typeof response === "string") {
                visitor.typeReference(response);
            } else {
                visitObject(response, {
                    docs: createDocsVisitor(visitor),
                    type: visitor.typeReference,
                });
            }
        },
        errors: (errors) => {
            if (errors == null) {
                return;
            }
            for (const error of errors) {
                if (typeof error === "string") {
                    visitor.typeReference(error);
                } else {
                    visitObject(error, {
                        docs: createDocsVisitor(visitor),
                        error: visitor.errorReference,
                    });
                }
            }
        },
    });
}
