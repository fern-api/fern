import { generatorsYml } from "@fern-api/configuration";
import { cloneDeep, isEqual } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

export const DEFAULT_ERROR_RESPONSE_TYPE_NAME = "ProblemDetails";

const DEFAULT_ERROR_MEDIA_TYPE = "application/json";

const HTTP_METHODS: readonly generatorsYml.OpenApiErrorResponsesHttpMethod[] = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
    "trace"
];

const STATUS_CODE_DESCRIPTIONS: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    412: "Precondition Failed",
    413: "Payload Too Large",
    415: "Unsupported Media Type",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout"
};

export interface ApplyErrorResponsesArgs {
    document: OpenAPIV3.Document;
    errorResponses: generatorsYml.OpenApiErrorResponsesSchema;
    /**
     * The error body schema as a parsed YAML/JSON mapping: the loaded contents of
     * `errorResponses.schema` when it is a file path, otherwise the inline mapping itself.
     */
    schema: Record<string, unknown>;
}

/**
 * Rewrites the 4xx/5xx responses of every operation in `document` to use a single error body schema.
 *
 * - The schema is registered under `components.schemas[name]` and referenced from each response,
 *   so it converts to one shared Fern type (unless `schema` is itself a `$ref`, which is used as-is).
 *   Any `$ref` inside the schema must be a local `#/...` pointer into `document`. A pre-existing
 *   schema of the same name is replaced if, once the error responses have been rewritten, nothing
 *   in the document references it anymore; otherwise it is an error.
 * - `apply-to: all` replaces the body of every error response; `untyped` only fills in
 *   error responses that declare no body schema.
 * - `ensure` adds the listed status codes to operations (filtered by method) that do not declare them.
 *
 * Descriptions, headers and non-error responses are left untouched. Examples are kept unless they
 * belonged to a body schema that gets replaced. Error responses that reference a shared
 * `#/components/responses/...` entry are inlined as a modified copy so the shared entry (which may
 * also back non-error responses) is never mutated. Mutates and returns `document`.
 */
export function applyErrorResponses({ document, errorResponses, schema }: ApplyErrorResponsesArgs): OpenAPIV3.Document {
    if (!isOpenApiSchema(schema)) {
        throw new Error("error-responses.schema must be an OpenAPI schema object or a $ref");
    }
    const nonLocalRefs = collectNonLocalRefs(schema);
    if (nonLocalRefs.length > 0) {
        throw new Error(
            `error-responses.schema may only contain local "#/..." references into the OpenAPI document. ` +
                `Found: ${nonLocalRefs.join(", ")}`
        );
    }
    const applyTo = errorResponses["apply-to"] ?? "all";
    const ensure = errorResponses.ensure ?? [];
    for (const rule of ensure) {
        if (!isErrorStatusCode(rule["status-code"].toString())) {
            throw new Error(
                `error-responses.ensure.status-code must be between 400 and 599, got ${rule["status-code"]}`
            );
        }
    }
    const errorSchemaRef = getErrorSchemaRef({ schema, name: errorResponses.name });

    for (const pathItem of Object.values(document.paths)) {
        if (pathItem == null) {
            continue;
        }
        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (operation == null) {
                continue;
            }
            const responses: OpenAPIV3.ResponsesObject = operation.responses ?? {};
            operation.responses = responses;

            for (const [statusCode, response] of Object.entries(responses)) {
                if (!isErrorStatusCode(statusCode)) {
                    continue;
                }
                const resolved = resolveResponse({ document, response });
                if (resolved == null) {
                    continue;
                }
                if (applyTo === "all" || !hasBodySchema(resolved)) {
                    const target = isReferenceObject(response) ? cloneDeep(resolved) : resolved;
                    setErrorBody({ response: target, errorSchemaRef });
                    responses[statusCode] = target;
                }
            }

            for (const rule of ensure) {
                const statusCode = rule["status-code"].toString();
                if (responses[statusCode] != null || !(rule.methods ?? HTTP_METHODS).includes(method)) {
                    continue;
                }
                responses[statusCode] = {
                    description: STATUS_CODE_DESCRIPTIONS[rule["status-code"]] ?? `Error ${statusCode}`,
                    content: {
                        [DEFAULT_ERROR_MEDIA_TYPE]: { schema: errorSchemaRef }
                    }
                };
            }
        }
    }

    if (!isReferenceObject(schema)) {
        registerErrorSchema({ document, schema, name: errorResponses.name, errorSchemaRef });
    }

    return document;
}

function getErrorSchemaName({ schema, name }: { schema: OpenAPIV3.SchemaObject; name: string | undefined }): string {
    return name ?? schema.title ?? DEFAULT_ERROR_RESPONSE_TYPE_NAME;
}

/**
 * The single `$ref` object inserted into every rewritten response. Sharing one instance lets
 * `registerErrorSchema` tell the references it inserted apart from pre-existing ones of the same name.
 */
function getErrorSchemaRef({
    schema,
    name
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    name: string | undefined;
}): OpenAPIV3.ReferenceObject {
    if (isReferenceObject(schema)) {
        return schema;
    }
    return { $ref: `#/components/schemas/${escapeJsonPointerSegment(getErrorSchemaName({ schema, name }))}` };
}

function registerErrorSchema({
    document,
    schema,
    name,
    errorSchemaRef
}: {
    document: OpenAPIV3.Document;
    schema: OpenAPIV3.SchemaObject;
    name: string | undefined;
    errorSchemaRef: OpenAPIV3.ReferenceObject;
}): void {
    const schemaName = getErrorSchemaName({ schema, name });
    const components: OpenAPIV3.ComponentsObject = document.components ?? {};
    document.components = components;
    const schemas = components.schemas ?? {};
    components.schemas = schemas;
    const existing = schemas[schemaName];
    if (existing != null && !isEqual(existing, schema)) {
        const remainingRefs = findRemainingRefsToLegacySchema({ document, schemaName, errorSchemaRef });
        if (remainingRefs.length > 0) {
            throw new Error(
                `error-responses: components.schemas already contains a different schema named "${schemaName}" ` +
                    `that is still referenced from ${remainingRefs.join(", ")}. ` +
                    `Set error-responses.name to an unused name, or reference the existing schema with ` +
                    `\`schema: { $ref: "#/components/schemas/${schemaName}" }\`.`
            );
        }
    }
    schemas[schemaName] = schema;
}

/**
 * JSON Pointers of every `$ref` to `components.schemas[schemaName]` that `applyErrorResponses` did
 * not insert itself. The legacy schema body and shared `components.responses` entries that are no
 * longer referenced from anywhere (their error uses were inlined as copies) are not counted.
 */
function findRemainingRefsToLegacySchema({
    document,
    schemaName,
    errorSchemaRef
}: {
    document: OpenAPIV3.Document;
    schemaName: string;
    errorSchemaRef: OpenAPIV3.ReferenceObject;
}): string[] {
    const referencedResponseNames = new Set<string>();
    const responsesPrefix = "#/components/responses/";
    walkRefs(document, ({ ref }) => {
        if (ref.$ref.startsWith(responsesPrefix)) {
            referencedResponseNames.add(unescapeJsonPointerSegment(ref.$ref.slice(responsesPrefix.length)));
        }
    });

    const remaining: string[] = [];
    walkRefs(document, ({ ref, path }) => {
        if (ref === errorSchemaRef || ref.$ref !== errorSchemaRef.$ref) {
            return;
        }
        const [components, section, entryName] = path;
        if (components === "components" && section === "schemas" && entryName === schemaName) {
            return;
        }
        if (
            components === "components" &&
            section === "responses" &&
            entryName != null &&
            !referencedResponseNames.has(entryName)
        ) {
            return;
        }
        remaining.push(`#/${path.map(escapeJsonPointerSegment).join("/")}`);
    });
    return remaining;
}

function walkRefs(
    value: unknown,
    visit: (found: { ref: OpenAPIV3.ReferenceObject; path: string[] }) => void,
    path: string[] = []
): void {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => {
            walkRefs(entry, visit, [...path, index.toString()]);
        });
        return;
    }
    if (!isRecord(value)) {
        return;
    }
    if (isReferenceObject(value) && typeof value.$ref === "string") {
        visit({ ref: value, path });
        return;
    }
    for (const [key, entry] of Object.entries(value)) {
        walkRefs(entry, visit, [...path, key]);
    }
}

function escapeJsonPointerSegment(segment: string): string {
    return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

function unescapeJsonPointerSegment(segment: string): string {
    return segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function collectNonLocalRefs(value: unknown, found: string[] = []): string[] {
    if (Array.isArray(value)) {
        for (const entry of value) {
            collectNonLocalRefs(entry, found);
        }
    } else if (isRecord(value)) {
        for (const [key, entry] of Object.entries(value)) {
            if (key === "$ref" && typeof entry === "string" && !entry.startsWith("#/")) {
                found.push(entry);
            } else {
                collectNonLocalRefs(entry, found);
            }
        }
    }
    return found;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Follows a local `#/components/responses/...` reference to the shared response object.
 */
function resolveResponse({
    document,
    response
}: {
    document: OpenAPIV3.Document;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject;
}): OpenAPIV3.ResponseObject | undefined {
    if (!isReferenceObject(response)) {
        return response;
    }
    const prefix = "#/components/responses/";
    if (!response.$ref.startsWith(prefix)) {
        return undefined;
    }
    const target = document.components?.responses?.[response.$ref.slice(prefix.length)];
    if (target == null || isReferenceObject(target)) {
        return undefined;
    }
    return target;
}

function setErrorBody({
    response,
    errorSchemaRef
}: {
    response: OpenAPIV3.ResponseObject;
    errorSchemaRef: OpenAPIV3.ReferenceObject;
}): void {
    const content = response.content ?? {};
    response.content = content;
    const mediaTypes = Object.keys(content);
    if (mediaTypes.length === 0) {
        content[DEFAULT_ERROR_MEDIA_TYPE] = { schema: errorSchemaRef };
        return;
    }
    for (const mediaType of mediaTypes) {
        const mediaObject = content[mediaType] ?? {};
        if (mediaObject.schema == null) {
            content[mediaType] = { ...mediaObject, schema: errorSchemaRef };
            continue;
        }
        const { example: _example, examples: _examples, ...rest } = mediaObject;
        content[mediaType] = { ...rest, schema: errorSchemaRef };
    }
}

function hasBodySchema(response: OpenAPIV3.ResponseObject): boolean {
    return Object.values(response.content ?? {}).some((mediaObject) => mediaObject.schema != null);
}

function isErrorStatusCode(statusCode: string): boolean {
    if (/^[45]XX$/i.test(statusCode)) {
        return true;
    }
    const code = Number(statusCode);
    return Number.isInteger(code) && code >= 400 && code <= 599;
}

function isReferenceObject(value: object): value is OpenAPIV3.ReferenceObject {
    return "$ref" in value;
}

/**
 * Every OpenAPI schema keyword is optional, so any mapping is a structurally valid schema object
 * as long as `$ref`, when present, is a string. The parser validates the keywords themselves.
 */
function isOpenApiSchema(
    value: Record<string, unknown>
): value is Record<string, unknown> & (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject) {
    return value.$ref === undefined || typeof value.$ref === "string";
}
