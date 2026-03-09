import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
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
    cliContext
}: {
    openapiPath: AbsoluteFilePath;
    overridesPath: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        // Validate files exist
        if (!(await doesPathExist(openapiPath))) {
            return context.failAndThrow(`OpenAPI spec file does not exist: ${openapiPath}`);
        }
        if (!(await doesPathExist(overridesPath))) {
            return context.failAndThrow(`Overrides file does not exist: ${overridesPath}`);
        }

        context.logger.info(`Merging ${overridesPath} into ${openapiPath}`);

        // Load both files
        const openapi = await loadYamlOrJson(openapiPath, context);
        const overrides = await loadYamlOrJson(overridesPath, context);

        // Merge the x-fern-examples into native OpenAPI examples
        const merged = mergeExamplesIntoSpec(openapi, overrides, context);

        // Determine output format based on output file extension
        const isJson = outputPath.endsWith(".json");
        const output = isJson ? JSON.stringify(merged, null, 2) : yaml.dump(merged, { lineWidth: -1, noRefs: true });

        await writeFile(outputPath, output);

        context.logger.info(`Merged output written to ${outputPath}`);
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
            return context.failAndThrow(`Failed to parse file as JSON or YAML: ${filepath}`);
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

            if (fernExamples.length === 1) {
                applyExampleToOperation(specOperation, fernExamples[0], merged);
            } else {
                applyMultipleExamplesToOperation(specOperation, fernExamples, merged);
            }
        }
    }

    // Strip all x-fern-examples from the merged spec
    stripFernExamples(merged);

    return merged;
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

/**
 * Sets `example` on matching parameters (by name and location).
 */
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

/**
 * Sets named entries in `examples` on matching parameters.
 */
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

/**
 * Sets a named entry in `examples` on the request body's first content type.
 */
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

/**
 * Sets `example` on the first success response's first content type.
 */
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

/**
 * Sets a named entry in `examples` on the first success response's first content type.
 */
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

/**
 * Returns the first success (2xx) response object from the operation.
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
