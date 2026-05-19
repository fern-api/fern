// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

/**
 * Iterates over paths/methods in the overrides and integrates x-fern-examples
 * into native OpenAPI example fields in the base spec.
 *
 * Mapping:
 *   - path-parameters   -> parameters[].example (where in: path)
 *   - query-parameters  -> parameters[].example (where in: query)
 *   - headers           -> parameters[].example (where in: header)
 *   - request.body      -> requestBody.content.*.example
 *   - response.body     -> responses.<status>.content.*.example
 */
export function mergeExamplesIntoSpec(
    spec: OpenAPISpec,
    overrides: OpenAPISpec,
    logger: { warn: (msg: string) => void }
): OpenAPISpec {
    const merged = structuredClone(spec);

    const overridePaths = overrides.paths;
    if (overridePaths == null || typeof overridePaths !== "object") {
        return merged;
    }

    if (merged.paths == null) {
        merged.paths = {};
    }

    for (const [overridePath, pathItem] of Object.entries(overridePaths)) {
        if (pathItem == null || typeof pathItem !== "object") {
            continue;
        }

        const specPath = findMatchingSpecPath(overridePath, merged.paths);
        if (specPath == null) {
            logger.warn(`Path ${overridePath} not found in OpenAPI spec, skipping.`);
            continue;
        }

        for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) {
                continue;
            }

            const specOperation = merged.paths[specPath][method];
            if (specOperation == null || typeof specOperation !== "object") {
                logger.warn(`Operation ${method.toUpperCase()} ${overridePath} not found in OpenAPI spec, skipping.`);
                continue;
            }

            // biome-ignore lint/suspicious/noExplicitAny: x-fern-examples has dynamic shape
            const fernExamples = (operation as any)?.["x-fern-examples"];
            if (!Array.isArray(fernExamples) || fernExamples.length === 0) {
                continue;
            }

            if (fernExamples.length === 1) {
                applyExampleToOperation(specOperation, fernExamples[0], merged);
            } else {
                applyMultipleExamplesToOperation(specOperation, fernExamples, merged);
            }
        }
    }

    stripFernExamples(merged);

    return merged;
}

/**
 * Extracts only the enriched examples from a merged spec by diffing against
 * the original spec. Returns a minimal spec containing only the paths and
 * operations that gained example fields.
 */
export function extractEnrichedExamples(original: OpenAPISpec, enriched: OpenAPISpec): OpenAPISpec {
    const examples: OpenAPISpec = {};

    const enrichedPaths = enriched.paths;
    const originalPaths = original.paths ?? {};
    if (enrichedPaths == null || typeof enrichedPaths !== "object") {
        return examples;
    }

    for (const [pathKey, pathItem] of Object.entries(enrichedPaths)) {
        if (pathItem == null || typeof pathItem !== "object") {
            continue;
        }
        const originalPathItem = originalPaths[pathKey] ?? {};

        for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) {
                continue;
            }
            if (operation == null || typeof operation !== "object") {
                continue;
            }

            const originalOp = (originalPathItem as Record<string, unknown>)?.[method];
            const exampleFields = extractOperationExamples(
                operation as Record<string, unknown>,
                (originalOp ?? {}) as Record<string, unknown>
            );

            if (exampleFields != null) {
                if (examples.paths == null) {
                    examples.paths = {};
                }
                if (examples.paths[pathKey] == null) {
                    examples.paths[pathKey] = {};
                }
                examples.paths[pathKey][method] = exampleFields;
            }
        }
    }

    return examples;
}

/**
 * Extracts example fields from an operation that were not present in the original.
 */
function extractOperationExamples(
    enrichedOp: Record<string, unknown>,
    originalOp: Record<string, unknown>
): Record<string, unknown> | undefined {
    const result: Record<string, unknown> = {};
    let hasExamples = false;

    // Check parameters for new examples
    if (Array.isArray(enrichedOp.parameters)) {
        const originalParams = Array.isArray(originalOp.parameters) ? originalOp.parameters : [];
        const paramsWithExamples: unknown[] = [];
        for (const param of enrichedOp.parameters as Array<Record<string, unknown>>) {
            const origParam = originalParams.find(
                (p: Record<string, unknown>) => p.name === param.name && p.in === param.in
            );
            if (
                (param.example !== undefined && origParam?.example === undefined) ||
                (param.examples !== undefined && origParam?.examples === undefined)
            ) {
                paramsWithExamples.push({
                    name: param.name,
                    in: param.in,
                    ...(param.example !== undefined ? { example: param.example } : {}),
                    ...(param.examples !== undefined ? { examples: param.examples } : {})
                });
                hasExamples = true;
            }
        }
        if (paramsWithExamples.length > 0) {
            result.parameters = paramsWithExamples;
        }
    }

    // Check requestBody for new examples
    const enrichedBody = enrichedOp.requestBody as Record<string, unknown> | undefined;
    const originalBody = originalOp.requestBody as Record<string, unknown> | undefined;
    if (enrichedBody?.content != null) {
        const enrichedContent = enrichedBody.content as Record<string, Record<string, unknown>>;
        const originalContent = (originalBody?.content ?? {}) as Record<string, Record<string, unknown>>;
        const bodyExamples: Record<string, Record<string, unknown>> = {};
        for (const [contentType, mediaType] of Object.entries(enrichedContent)) {
            const origMedia = originalContent[contentType] ?? {};
            if (
                (mediaType.example !== undefined && origMedia.example === undefined) ||
                (mediaType.examples !== undefined && origMedia.examples === undefined)
            ) {
                bodyExamples[contentType] = {
                    ...(mediaType.example !== undefined ? { example: mediaType.example } : {}),
                    ...(mediaType.examples !== undefined ? { examples: mediaType.examples } : {})
                };
                hasExamples = true;
            }
        }
        if (Object.keys(bodyExamples).length > 0) {
            result.requestBody = { content: bodyExamples };
        }
    }

    // Check responses for new examples
    const enrichedResponses = enrichedOp.responses as Record<string, Record<string, unknown>> | undefined;
    const originalResponses = originalOp.responses as Record<string, Record<string, unknown>> | undefined;
    if (enrichedResponses != null) {
        const responseExamples: Record<string, unknown> = {};
        for (const [statusCode, response] of Object.entries(enrichedResponses)) {
            if (response?.content == null) {
                continue;
            }
            const origResponse = originalResponses?.[statusCode] ?? {};
            const origContent = (origResponse.content ?? {}) as Record<string, Record<string, unknown>>;
            const respContent = response.content as Record<string, Record<string, unknown>>;
            const contentExamples: Record<string, Record<string, unknown>> = {};
            for (const [contentType, mediaType] of Object.entries(respContent)) {
                const origMedia = origContent[contentType] ?? {};
                if (
                    (mediaType.example !== undefined && origMedia.example === undefined) ||
                    (mediaType.examples !== undefined && origMedia.examples === undefined)
                ) {
                    contentExamples[contentType] = {
                        ...(mediaType.example !== undefined ? { example: mediaType.example } : {}),
                        ...(mediaType.examples !== undefined ? { examples: mediaType.examples } : {})
                    };
                    hasExamples = true;
                }
            }
            if (Object.keys(contentExamples).length > 0) {
                responseExamples[statusCode] = { content: contentExamples };
            }
        }
        if (Object.keys(responseExamples).length > 0) {
            result.responses = responseExamples;
        }
    }

    return hasExamples ? result : undefined;
}

/**
 * Applies a single x-fern-example to an OpenAPI operation using singular `example` fields.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operations have dynamic shape
function applyExampleToOperation(operation: any, fernExample: any, spec: OpenAPISpec): void {
    applyParameterExamples(operation, fernExample["path-parameters"], "path", spec);
    applyParameterExamples(operation, fernExample["query-parameters"], "query", spec);
    applyParameterExamples(operation, fernExample.headers, "header", spec);

    const requestBody = fernExample.request?.body;
    if (requestBody !== undefined) {
        applyRequestBodyExample(operation, requestBody);
    }

    const responseBody = fernExample.response?.body;
    if (responseBody !== undefined) {
        applyResponseBodyExample(operation, responseBody);
    }
}

/**
 * Applies multiple x-fern-examples to an OpenAPI operation using plural `examples` fields.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operations have dynamic shape
function applyMultipleExamplesToOperation(operation: any, fernExamples: any[], spec: OpenAPISpec): void {
    for (let i = 0; i < fernExamples.length; i++) {
        const fernExample = fernExamples[i];
        const exampleName = fernExample.name ?? `Example${i + 1}`;

        applyParameterNamedExamples(operation, fernExample["path-parameters"], "path", exampleName, spec);
        applyParameterNamedExamples(operation, fernExample["query-parameters"], "query", exampleName, spec);
        applyParameterNamedExamples(operation, fernExample.headers, "header", exampleName, spec);

        const requestBody = fernExample.request?.body;
        if (requestBody !== undefined) {
            applyRequestBodyNamedExample(operation, requestBody, exampleName);
        }

        const responseBody = fernExample.response?.body;
        if (responseBody !== undefined) {
            applyResponseBodyNamedExample(operation, responseBody, exampleName);
        }
    }
}

function applyParameterExamples(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
    operation: any,
    paramExamples: Record<string, unknown> | undefined,
    location: string,
    spec: OpenAPISpec
): void {
    if (paramExamples == null || typeof paramExamples !== "object") {
        return;
    }
    const parameters = resolveParameters(operation, spec);
    for (const [paramName, exampleValue] of Object.entries(paramExamples)) {
        // biome-ignore lint/suspicious/noExplicitAny: parameter shape
        const param = parameters.find((p: any) => p.name === paramName && p.in === location);
        if (param != null) {
            param.example = exampleValue;
        }
    }
}

function applyParameterNamedExamples(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
    operation: any,
    paramExamples: Record<string, unknown> | undefined,
    location: string,
    exampleName: string,
    spec: OpenAPISpec
): void {
    if (paramExamples == null || typeof paramExamples !== "object") {
        return;
    }
    const parameters = resolveParameters(operation, spec);
    for (const [paramName, exampleValue] of Object.entries(paramExamples)) {
        // biome-ignore lint/suspicious/noExplicitAny: parameter shape
        const param = parameters.find((p: any) => p.name === paramName && p.in === location);
        if (param != null) {
            if (param.examples == null) {
                param.examples = {};
            }
            param.examples[exampleName] = { value: exampleValue };
        }
    }
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
function resolveParameters(operation: any, spec: OpenAPISpec): any[] {
    if (!Array.isArray(operation.parameters)) {
        return [];
    }
    return operation.parameters.map((param: Record<string, unknown>, index: number) => {
        if (param.$ref != null && typeof param.$ref === "string") {
            const resolved = resolveRef(spec, param.$ref);
            if (resolved != null) {
                operation.parameters[index] = { ...resolved };
                return operation.parameters[index];
            }
        }
        return param;
    });
}

// biome-ignore lint/suspicious/noExplicitAny: ref resolution
function resolveRef(spec: OpenAPISpec, ref: string): any | undefined {
    if (!ref.startsWith("#/")) {
        return undefined;
    }
    const parts = ref.substring(2).split("/");
    // biome-ignore lint/suspicious/noExplicitAny: traversing spec
    let current: any = spec;
    for (const part of parts) {
        if (current == null || typeof current !== "object") {
            return undefined;
        }
        current = current[part];
    }
    return current;
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyRequestBodyExample(operation: any, bodyExample: unknown): void {
    if (operation.requestBody == null) {
        operation.requestBody = { content: { "application/json": { schema: {} } } };
    }
    const content = operation.requestBody.content;
    if (content == null) {
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        content[contentType].example = bodyExample;
    }
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyRequestBodyNamedExample(operation: any, bodyExample: unknown, exampleName: string): void {
    if (operation.requestBody == null) {
        operation.requestBody = { content: { "application/json": { schema: {} } } };
    }
    const content = operation.requestBody.content;
    if (content == null) {
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        if (content[contentType].examples == null) {
            content[contentType].examples = {};
        }
        content[contentType].examples[exampleName] = { value: bodyExample };
    }
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyResponseBodyExample(operation: any, responseExample: unknown): void {
    const response = getFirstSuccessResponse(operation);
    if (response == null) {
        return;
    }
    const content = response.content;
    if (content == null) {
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        content[contentType].example = responseExample;
    }
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyResponseBodyNamedExample(operation: any, responseExample: unknown, exampleName: string): void {
    const response = getFirstSuccessResponse(operation);
    if (response == null) {
        return;
    }
    const content = response.content;
    if (content == null) {
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        if (content[contentType].examples == null) {
            content[contentType].examples = {};
        }
        content[contentType].examples[exampleName] = { value: responseExample };
    }
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI responses shape
function getFirstSuccessResponse(operation: any): any | undefined {
    const responses = operation.responses;
    if (responses == null || typeof responses !== "object") {
        return undefined;
    }
    for (const code of ["200", "201", "202", "203", "204"]) {
        if (responses[code] != null) {
            return responses[code];
        }
    }
    for (const code of Object.keys(responses)) {
        if (code.startsWith("2")) {
            return responses[code];
        }
    }
    return undefined;
}

function getFirstContentType(content: Record<string, unknown>): string | undefined {
    const keys = Object.keys(content);
    return keys.length > 0 ? keys[0] : undefined;
}

/**
 * Finds a matching spec path for an override path.
 * Supports exact matches and fuzzy matches where override paths use bare
 * parameter names (e.g. `/customers/customerId`) that correspond to
 * templated spec paths (e.g. `/customers/{customerId}`).
 */
export function findMatchingSpecPath(overridePath: string, specPaths: Record<string, unknown>): string | undefined {
    if (specPaths[overridePath] != null) {
        return overridePath;
    }

    const overrideSegments = overridePath.split("/");

    for (const specPath of Object.keys(specPaths)) {
        const specSegments = specPath.split("/");
        if (specSegments.length !== overrideSegments.length) {
            continue;
        }

        let matches = true;
        for (let i = 0; i < specSegments.length; i++) {
            const specSeg = specSegments[i];
            const overrideSeg = overrideSegments[i];
            if (specSeg === overrideSeg) {
                continue;
            }
            if (specSeg != null && specSeg.startsWith("{") && specSeg.endsWith("}")) {
                const paramName = specSeg.slice(1, -1);
                if (paramName === overrideSeg) {
                    continue;
                }
            }
            matches = false;
            break;
        }

        if (matches) {
            return specPath;
        }
    }

    return undefined;
}

function stripFernExamples(spec: OpenAPISpec): void {
    const paths = spec.paths;
    if (paths == null || typeof paths !== "object") {
        return;
    }
    for (const pathItem of Object.values(paths)) {
        if (pathItem == null || typeof pathItem !== "object") {
            continue;
        }
        for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) {
                continue;
            }
            if (operation != null && typeof operation === "object" && "x-fern-examples" in operation) {
                delete (operation as Record<string, unknown>)["x-fern-examples"];
            }
        }
    }
}
