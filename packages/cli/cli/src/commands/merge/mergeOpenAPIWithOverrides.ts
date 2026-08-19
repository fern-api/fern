import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext.js";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

/**
 * Merges an AI examples overrides file into an OpenAPI spec.
 * The overrides file contains paths with x-fern-examples that are decomposed
 * and integrated into native OpenAPI example fields per endpoint.
 *
 * Mapping:
 *   - path-parameters   -> parameters[].example (where in: path)
 *   - query-parameters  -> parameters[].example (where in: query)
 *   - headers           -> parameters[].example (where in: header)
 *   - request.body      -> requestBody.content.*.example
 *   - response.body     -> responses.<status>.content.*.example
 */
export async function mergeOpenAPIWithOverrides({
    openapiPath,
    overridesPath,
    outputPath,
    split = false,
    cliContext
}: {
    openapiPath: AbsoluteFilePath;
    overridesPath: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    split?: boolean;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        // Validate files exist
        if (!(await doesPathExist(openapiPath))) {
            return context.failAndThrow(`OpenAPI spec file does not exist: ${openapiPath}`, undefined, {
                code: CliError.Code.ConfigError
            });
        }
        if (!(await doesPathExist(overridesPath))) {
            return context.failAndThrow(`Overrides file does not exist: ${overridesPath}`, undefined, {
                code: CliError.Code.ConfigError
            });
        }

        context.logger.info(`Merging ${overridesPath} into ${openapiPath}`);

        // Load both files
        const openapi = await loadYamlOrJson(openapiPath, context);
        const overrides = await loadYamlOrJson(overridesPath, context);

        // Merge the x-fern-examples into native OpenAPI examples
        const merged = mergeExamplesIntoSpec(openapi, overrides, context);

        // Determine output format based on output file extension
        const isJson = outputPath.endsWith(".json");

        if (split) {
            const examples = extractEnrichedExamples(openapi, merged);
            const output = isJson
                ? JSON.stringify(examples, null, 2)
                : yaml.dump(examples, { lineWidth: -1, noRefs: true });
            await writeFile(outputPath, output);
            context.logger.info(`Extracted enriched examples written to ${outputPath}`);
        } else {
            const output = isJson
                ? JSON.stringify(merged, null, 2)
                : yaml.dump(merged, { lineWidth: -1, noRefs: true });
            await writeFile(outputPath, output);
            if (outputPath === openapiPath) {
                context.logger.info(`Enriched ${openapiPath} in-place`);
            } else {
                context.logger.info(`Merged output written to ${outputPath}`);
            }
        }
    });
}

// biome-ignore lint/suspicious/noExplicitAny: YAML/JSON files can have any shape
async function loadYamlOrJson(filepath: AbsoluteFilePath, context: any): Promise<OpenAPISpec> {
    const contents = await readFile(filepath, "utf8");
    try {
        return JSON.parse(contents);
    } catch {
        try {
            return yaml.load(contents) as OpenAPISpec;
        } catch (err) {
            return context.failAndThrow(`Failed to parse file as JSON or YAML: ${filepath}`, undefined, {
                code: CliError.Code.ParseError
            });
        }
    }
}

/**
 * Iterates over paths/methods in the overrides and integrates x-fern-examples
 * into native OpenAPI example fields in the base spec.
 */
// biome-ignore lint/suspicious/noExplicitAny: context logger
export function mergeExamplesIntoSpec(spec: OpenAPISpec, overrides: OpenAPISpec, context: any): OpenAPISpec {
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
            context.logger.warn(`Path ${overridePath} not found in OpenAPI spec, skipping.`);
            continue;
        }

        for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) {
                continue;
            }

            const specOperation = merged.paths[specPath][method];
            if (specOperation == null || typeof specOperation !== "object") {
                context.logger.warn(
                    `Operation ${method.toUpperCase()} ${overridePath} not found in OpenAPI spec, skipping.`
                );
                continue;
            }

            // biome-ignore lint/suspicious/noExplicitAny: x-fern-examples has dynamic shape
            const fernExamples = (operation as any)?.["x-fern-examples"];
            if (!Array.isArray(fernExamples) || fernExamples.length === 0) {
                continue;
            }

            const warnForOp = (msg: string): void => {
                context.logger.warn(`${method.toUpperCase()} ${overridePath}: ${msg}`);
            };

            if (fernExamples.length === 1) {
                applyExampleToOperation(specOperation, fernExamples[0], merged, warnForOp);
            } else {
                applyMultipleExamplesToOperation(specOperation, fernExamples, merged, warnForOp);
            }
        }
    }

    // Strip all x-fern-examples from the merged spec
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
                (originalOp ?? {}) as Record<string, unknown>,
                original
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
    originalOp: Record<string, unknown>,
    originalSpec: OpenAPISpec
): Record<string, unknown> | undefined {
    const result: Record<string, unknown> = {};
    let hasExamples = false;

    // Check parameters for new examples
    if (Array.isArray(enrichedOp.parameters)) {
        // Resolve $refs on the original side so we can compare against the inlined
        // shape that the merge process produced. Without this, every parameter that
        // was originally a $ref would falsely appear as newly-enriched even when
        // the referenced component already carried an example.
        const originalParams = Array.isArray(originalOp.parameters)
            ? (originalOp.parameters as Array<Record<string, unknown>>).map((p) => {
                  if (typeof p?.$ref === "string") {
                      const resolved = resolveRef(originalSpec, p.$ref);
                      if (resolved != null && typeof resolved === "object") {
                          return resolved as Record<string, unknown>;
                      }
                  }
                  return p;
              })
            : [];
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

type WarnFn = (msg: string) => void;

/**
 * Applies a single x-fern-example to an OpenAPI operation using singular `example` fields.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operations have dynamic shape
function applyExampleToOperation(operation: any, fernExample: any, spec: OpenAPISpec, warn: WarnFn): void {
    applyParameterExamples(operation, fernExample["path-parameters"], "path", spec, warn);
    applyParameterExamples(operation, fernExample["query-parameters"], "query", spec, warn);
    applyParameterExamples(operation, fernExample.headers, "header", spec, warn);

    const requestBody = fernExample.request?.body;
    if (requestBody !== undefined) {
        applyRequestBodyExample(operation, requestBody, warn);
    }

    const responseBody = fernExample.response?.body;
    if (responseBody !== undefined) {
        applyResponseBodyExample(operation, responseBody, warn);
    }
}

/**
 * Applies multiple x-fern-examples to an OpenAPI operation using plural `examples` fields.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operations have dynamic shape
function applyMultipleExamplesToOperation(operation: any, fernExamples: any[], spec: OpenAPISpec, warn: WarnFn): void {
    for (let i = 0; i < fernExamples.length; i++) {
        const fernExample = fernExamples[i];
        const exampleName = fernExample.name ?? `Example${i + 1}`;

        applyParameterNamedExamples(operation, fernExample["path-parameters"], "path", exampleName, spec, warn);
        applyParameterNamedExamples(operation, fernExample["query-parameters"], "query", exampleName, spec, warn);
        applyParameterNamedExamples(operation, fernExample.headers, "header", exampleName, spec, warn);

        const requestBody = fernExample.request?.body;
        if (requestBody !== undefined) {
            applyRequestBodyNamedExample(operation, requestBody, exampleName, warn);
        }

        const responseBody = fernExample.response?.body;
        if (responseBody !== undefined) {
            applyResponseBodyNamedExample(operation, responseBody, exampleName, warn);
        }
    }
}

// Header names are case-insensitive per RFC 7230, so match accordingly when location is "header".
function matchParameter(
    parameters: Array<Record<string, unknown>>,
    paramName: string,
    location: string
    // biome-ignore lint/suspicious/noExplicitAny: parameter shape
): any | undefined {
    if (location === "header") {
        const lower = paramName.toLowerCase();
        return parameters.find(
            (p: Record<string, unknown>) =>
                typeof p.name === "string" && p.name.toLowerCase() === lower && p.in === "header"
        );
    }
    return parameters.find((p: Record<string, unknown>) => p.name === paramName && p.in === location);
}

/**
 * Sets `example` on matching parameters (by name and location).
 */
function applyParameterExamples(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
    operation: any,
    paramExamples: Record<string, unknown> | undefined,
    location: string,
    spec: OpenAPISpec,
    warn: WarnFn
): void {
    if (paramExamples == null || typeof paramExamples !== "object") {
        return;
    }
    const parameters = resolveParameters(operation, spec);
    for (const [paramName, exampleValue] of Object.entries(paramExamples)) {
        const param = matchParameter(parameters, paramName, location);
        if (param != null) {
            param.example = exampleValue;
        } else {
            warn(`no ${location} parameter named '${paramName}' found in spec; example skipped.`);
        }
    }
}

/**
 * Sets named entries in `examples` on matching parameters.
 */
function applyParameterNamedExamples(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
    operation: any,
    paramExamples: Record<string, unknown> | undefined,
    location: string,
    exampleName: string,
    spec: OpenAPISpec,
    warn: WarnFn
): void {
    if (paramExamples == null || typeof paramExamples !== "object") {
        return;
    }
    const parameters = resolveParameters(operation, spec);
    for (const [paramName, exampleValue] of Object.entries(paramExamples)) {
        const param = matchParameter(parameters, paramName, location);
        if (param != null) {
            if (param.examples == null) {
                param.examples = {};
            }
            param.examples[exampleName] = { value: exampleValue };
        } else {
            warn(`no ${location} parameter named '${paramName}' found in spec; example '${exampleName}' skipped.`);
        }
    }
}

/**
 * Resolves the parameters array for an operation, including any $ref parameters.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI parameter shapes
function resolveParameters(operation: any, spec: OpenAPISpec): any[] {
    if (!Array.isArray(operation.parameters)) {
        return [];
    }
    return operation.parameters.map((param: Record<string, unknown>, index: number) => {
        if (param.$ref != null && typeof param.$ref === "string") {
            const resolved = resolveRef(spec, param.$ref as string);
            if (resolved != null) {
                operation.parameters[index] = { ...resolved };
                return operation.parameters[index];
            }
        }
        return param;
    });
}

/**
 * Resolves a JSON $ref pointer within the spec.
 */
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

/**
 * Sets `example` on the request body's first content type.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyRequestBodyExample(operation: any, bodyExample: unknown, warn: WarnFn): void {
    if (operation.requestBody == null) {
        warn("spec defines no requestBody; request.body example skipped.");
        return;
    }
    const content = operation.requestBody.content;
    if (content == null) {
        warn("spec requestBody defines no content; request.body example skipped.");
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        content[contentType].example = bodyExample;
    }
}

/**
 * Sets a named entry in `examples` on the request body's first content type.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyRequestBodyNamedExample(operation: any, bodyExample: unknown, exampleName: string, warn: WarnFn): void {
    if (operation.requestBody == null) {
        warn(`spec defines no requestBody; request.body example '${exampleName}' skipped.`);
        return;
    }
    const content = operation.requestBody.content;
    if (content == null) {
        warn(`spec requestBody defines no content; request.body example '${exampleName}' skipped.`);
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

/**
 * Sets `example` on the first success response's first content type.
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
function applyResponseBodyExample(operation: any, responseExample: unknown, warn: WarnFn): void {
    const response = getFirstSuccessResponse(operation);
    if (response == null) {
        warn("spec defines no 2xx or default response; response.body example skipped.");
        return;
    }
    const content = response.content;
    if (content == null) {
        warn("spec response defines no content; response.body example skipped.");
        return;
    }
    const contentType = getFirstContentType(content);
    if (contentType != null) {
        content[contentType].example = responseExample;
    }
}

/**
 * Sets a named entry in `examples` on the first success response's first content type.
 */
function applyResponseBodyNamedExample(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI operation shape
    operation: any,
    responseExample: unknown,
    exampleName: string,
    warn: WarnFn
): void {
    const response = getFirstSuccessResponse(operation);
    if (response == null) {
        warn(`spec defines no 2xx or default response; response.body example '${exampleName}' skipped.`);
        return;
    }
    const content = response.content;
    if (content == null) {
        warn(`spec response defines no content; response.body example '${exampleName}' skipped.`);
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

/**
 * Returns the first success (2xx) response object from the operation, falling
 * back to the "default" response if no 2xx is declared.
 */
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
    if (responses.default != null) {
        return responses.default;
    }
    return undefined;
}

/**
 * Returns the first content type key from a content map.
 */
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
    // Try exact match first
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
            // Match templated segment {param} against bare param name
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

/**
 * Strips all x-fern-examples from every operation in the spec.
 */
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
