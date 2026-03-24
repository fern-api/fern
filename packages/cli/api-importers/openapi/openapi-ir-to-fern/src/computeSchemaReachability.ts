import { assertNever } from "@fern-api/core-utils";
import { OneOfSchema, OpenApiIntermediateRepresentation, Schema, SchemaId, Schemas } from "@fern-api/openapi-ir";

export interface SchemaReachability {
    requestReachable: Set<SchemaId>;
    responseReachable: Set<SchemaId>;
}

export interface SchemaVariantPlan {
    /** Has readonly props + reachable from both request and response → generate Read + Write */
    needsBothVariants: Set<SchemaId>;
    /** Has readonly props + request only → single Write variant (strip readonly) */
    requestOnlyWithReadonly: Set<SchemaId>;
    /** Has readonly props + response only → single type with all props */
    responseOnlyWithReadonly: Set<SchemaId>;
}

/**
 * Performs a DFS over a schema graph, collecting all transitively reachable SchemaIds.
 */
function collectReachableSchemaIds(schema: Schema, groupedSchemas: Schemas, visited: Set<SchemaId>): void {
    switch (schema.type) {
        case "primitive":
        case "enum":
        case "literal":
        case "unknown":
            return;
        case "reference": {
            const refId = schema.schema;
            if (visited.has(refId)) {
                return;
            }
            visited.add(refId);
            const resolved = lookupSchema(refId, schema.namespace, groupedSchemas);
            if (resolved != null) {
                collectReachableSchemaIds(resolved, groupedSchemas, visited);
            }
            return;
        }
        case "object":
            for (const allOf of schema.allOf) {
                if (!visited.has(allOf.schema)) {
                    visited.add(allOf.schema);
                    const resolved = lookupSchema(allOf.schema, allOf.namespace, groupedSchemas);
                    if (resolved != null) {
                        collectReachableSchemaIds(resolved, groupedSchemas, visited);
                    }
                }
            }
            for (const property of schema.properties) {
                collectReachableSchemaIds(property.schema, groupedSchemas, visited);
            }
            return;
        case "array":
        case "map":
        case "optional":
        case "nullable":
            collectReachableSchemaIds(schema.value, groupedSchemas, visited);
            return;
        case "oneOf":
            collectOneOfReachable(schema.value, groupedSchemas, visited);
            return;
        default:
            assertNever(schema);
    }
}

function collectOneOfReachable(schema: OneOfSchema, groupedSchemas: Schemas, visited: Set<SchemaId>): void {
    switch (schema.type) {
        case "discriminated":
            for (const subSchema of Object.values(schema.schemas)) {
                collectReachableSchemaIds(subSchema, groupedSchemas, visited);
            }
            for (const commonProp of schema.commonProperties) {
                collectReachableSchemaIds(commonProp.schema, groupedSchemas, visited);
            }
            return;
        case "undiscriminated":
            for (const subSchema of schema.schemas) {
                collectReachableSchemaIds(subSchema, groupedSchemas, visited);
            }
            return;
        default:
            assertNever(schema);
    }
}

function lookupSchema(id: SchemaId, namespace: string | undefined, groupedSchemas: Schemas): Schema | undefined {
    if (namespace == null) {
        return groupedSchemas.rootSchemas[id];
    }
    return groupedSchemas.namespacedSchemas[namespace]?.[id];
}

/**
 * Seeds a target set with all SchemaIds transitively reachable from a root schema.
 */
function seedReachable(schema: Schema, groupedSchemas: Schemas, target: Set<SchemaId>): void {
    collectReachableSchemaIds(schema, groupedSchemas, target);
}

/**
 * Computes which schemas are reachable from request contexts vs response contexts
 * by doing a post-parse graph analysis over the IR.
 */
export function computeSchemaReachability(ir: OpenApiIntermediateRepresentation): SchemaReachability {
    const requestReachable = new Set<SchemaId>();
    const responseReachable = new Set<SchemaId>();
    const { groupedSchemas } = ir;

    for (const endpoint of ir.endpoints) {
        // Request roots
        if (endpoint.request != null) {
            switch (endpoint.request.type) {
                case "json":
                case "formUrlEncoded":
                    seedReachable(endpoint.request.schema, groupedSchemas, requestReachable);
                    break;
                case "multipart":
                    for (const prop of endpoint.request.properties) {
                        if (prop.schema.type === "json") {
                            seedReachable(prop.schema.value, groupedSchemas, requestReachable);
                        }
                    }
                    break;
                case "octetStream":
                    break;
                default:
                    assertNever(endpoint.request);
            }
        }

        // Response roots
        if (endpoint.response != null) {
            switch (endpoint.response.type) {
                case "json":
                case "streamingJson":
                case "streamingSse":
                    seedReachable(endpoint.response.schema, groupedSchemas, responseReachable);
                    break;
                case "file":
                case "text":
                case "bytes":
                case "streamingText":
                    break;
                default:
                    assertNever(endpoint.response);
            }
        }

        // Error schemas → response reachable
        for (const httpError of Object.values(endpoint.errors)) {
            if (httpError.schema != null) {
                seedReachable(httpError.schema, groupedSchemas, responseReachable);
            }
        }

        // Parameters → response reachable (they are non-request usage)
        for (const param of endpoint.pathParameters) {
            seedReachable(param.schema, groupedSchemas, responseReachable);
        }
        for (const param of endpoint.queryParameters) {
            seedReachable(param.schema, groupedSchemas, responseReachable);
        }
        for (const header of endpoint.headers) {
            seedReachable(header.schema, groupedSchemas, responseReachable);
        }
    }

    // Webhooks → response reachable
    for (const webhook of ir.webhooks) {
        seedReachable(webhook.payload, groupedSchemas, responseReachable);
    }

    // Channels → response reachable
    for (const channel of Object.values(ir.channels)) {
        for (const message of channel.messages) {
            seedReachable(message.body, groupedSchemas, responseReachable);
        }
        // Handshake parameters → response reachable
        for (const param of channel.handshake.queryParameters) {
            seedReachable(param.schema, groupedSchemas, responseReachable);
        }
        for (const header of channel.handshake.headers) {
            seedReachable(header.schema, groupedSchemas, responseReachable);
        }
        for (const param of channel.handshake.pathParameters) {
            seedReachable(param.schema, groupedSchemas, responseReachable);
        }
    }

    return { requestReachable, responseReachable };
}

/**
 * Returns true if the object schema has at least one property marked as readonly.
 */
function hasReadonlyProperties(schema: Schema): boolean {
    if (schema.type !== "object") {
        return false;
    }
    return schema.properties.some((prop) => prop.readonly === true);
}

/**
 * Given the reachability sets, computes which schemas need Read/Write variants,
 * which are request-only with readonly, and which are response-only with readonly.
 */
export function computeVariantPlan(
    ir: OpenApiIntermediateRepresentation,
    reachability: SchemaReachability
): SchemaVariantPlan {
    const needsBothVariants = new Set<SchemaId>();
    const requestOnlyWithReadonly = new Set<SchemaId>();
    const responseOnlyWithReadonly = new Set<SchemaId>();

    function classifySchemas(schemas: Record<SchemaId, Schema>): void {
        for (const [id, schema] of Object.entries(schemas)) {
            if (!hasReadonlyProperties(schema)) {
                continue;
            }
            const inRequest = reachability.requestReachable.has(id);
            const inResponse = reachability.responseReachable.has(id);

            if (inRequest && inResponse) {
                needsBothVariants.add(id);
            } else if (inRequest && !inResponse) {
                requestOnlyWithReadonly.add(id);
            } else if (!inRequest && inResponse) {
                responseOnlyWithReadonly.add(id);
            }
            // If neither: schema is unreferenced by endpoints, keep as-is
        }
    }

    classifySchemas(ir.groupedSchemas.rootSchemas);
    for (const schemas of Object.values(ir.groupedSchemas.namespacedSchemas)) {
        classifySchemas(schemas);
    }

    return { needsBothVariants, requestOnlyWithReadonly, responseOnlyWithReadonly };
}
