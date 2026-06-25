import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3 } from "@fern-api/lazy-fern-workspace";

import { Rule } from "../../Rule.js";
import { ValidationViolation } from "../../ValidationViolation.js";

/**
 * Validates that OpenAPI specs don't define header, query, or path parameters
 * whose camelCase-normalized names collide with each other — or with an inlined
 * request body property — on the same endpoint.
 *
 * SDK generators flatten path/query/header parameters and the properties of an
 * (object) request body into a single request wrapper. When two of these
 * normalize to the same camelCase name (e.g. a `Organization-Id` header and an
 * `organization_id` query param, or an `idType` path parameter and an `idType`
 * body property), generators produce broken code:
 *   - Python: SyntaxError from duplicate keyword arguments
 *   - TypeScript: duplicate interface property that silently shadows one value
 */
export const NoConflictingParameterNamesRule: Rule = {
    name: "no-conflicting-parameter-names",
    run: async ({ workspace, specs, loadedDocuments }) => {
        const violations: ValidationViolation[] = [];

        for (const spec of specs) {
            if (spec.type !== "openapi") {
                continue;
            }

            const openAPI = loadedDocuments.get(spec.absoluteFilepath);
            if (openAPI == null) {
                continue;
            }

            const apiToValidate = isOpenAPIV2(openAPI) ? await convertOpenAPIV2ToV3(openAPI) : openAPI;
            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            for (const [path, pathItem] of Object.entries(
                ((apiToValidate as Record<string, unknown>).paths as Record<string, unknown>) ?? {}
            )) {
                if (pathItem == null || typeof pathItem !== "object") {
                    continue;
                }

                const pathItemObj = pathItem as Record<string, unknown>;

                // Collect path-level parameters
                const pathLevelParams = resolveAllParams(pathItemObj.parameters, apiToValidate);

                // Check each operation
                for (const method of ["get", "put", "post", "delete", "options", "head", "patch", "trace"]) {
                    const operation = pathItemObj[method] as
                        | { parameters?: unknown[]; requestBody?: unknown }
                        | undefined;
                    if (operation == null) {
                        continue;
                    }

                    // Collect operation-level parameters
                    const operationParams = resolveAllParams(operation.parameters, apiToValidate);

                    // Merge path-level and operation-level parameters.
                    // Operation-level params override path-level params with the same `in` + `name`.
                    const mergedParams = mergeParameters(pathLevelParams, operationParams);

                    // Collect inlined request body properties. Generators flatten an object
                    // request body's properties into the same wrapper as the parameters, so a
                    // body property that normalizes to a parameter name produces broken code.
                    const bodyProperties = resolveRequestBodyProperties(operation.requestBody, apiToValidate);

                    // Group parameters by their camelCase-normalized name.
                    // Prefer x-fern-parameter-name when present, since SDK generators
                    // use that override instead of the raw OpenAPI `name`.
                    const nameToParams: Record<string, ResolvedParam[]> = {};
                    for (const param of [...mergedParams, ...bodyProperties]) {
                        const normalizedName = toCamelCase(param.fernParameterName ?? param.name);
                        if (normalizedName === "") {
                            continue;
                        }
                        const existing = (nameToParams[normalizedName] ??= []);
                        existing.push(param);
                    }

                    // Check for collisions between different parameter types
                    for (const [normalizedName, params] of Object.entries(nameToParams)) {
                        if (params.length <= 1) {
                            continue;
                        }

                        // Only report collisions that involve at least two different `in` locations
                        // (e.g. header + query, header + path). Same-type duplicates are a different issue.
                        const distinctTypes = new Set(params.map((p) => p.in));
                        if (distinctTypes.size <= 1) {
                            continue;
                        }

                        const paramDescriptions = params
                            .map((p) => {
                                const effectiveName = p.fernParameterName ?? p.name;
                                return p.in === "body"
                                    ? `request body property '${effectiveName}'`
                                    : `${p.in} parameter '${effectiveName}'`;
                            })
                            .join(", ");

                        violations.push({
                            name: "no-conflicting-parameter-names",
                            severity: "error",
                            relativeFilepath,
                            nodePath: ["paths", path, method],
                            message:
                                `${paramDescriptions} all normalize to '${normalizedName}' in generated SDKs. ` +
                                `This causes broken code (duplicate keyword arguments in Python, duplicate properties in TypeScript). ` +
                                `Rename one of them to avoid the collision ` +
                                `(use x-fern-parameter-name on a parameter, or x-fern-property-name on a body property).`
                        });
                    }
                }
            }
        }

        return violations;
    }
};

interface ResolvedParam {
    in: string;
    name: string;
    /** Override name from x-fern-parameter-name, used by SDKs instead of `name`. */
    fernParameterName?: string;
}

/**
 * Resolves an array of parameters (which may contain $ref objects) into
 * a flat array of ResolvedParam objects.
 */
function resolveAllParams(
    params: unknown,
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
    api: any
): ResolvedParam[] {
    if (!Array.isArray(params)) {
        return [];
    }
    const result: ResolvedParam[] = [];
    for (const param of params) {
        const resolved = resolveParam(param, api);
        if (resolved != null) {
            result.push(resolved);
        }
    }
    return result;
}

/**
 * Resolves a parameter, handling $ref if needed.
 */
function resolveParam(
    param: unknown,
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
    api: any,
    visited: Set<string> = new Set()
): ResolvedParam | undefined {
    if (typeof param !== "object" || param == null) {
        return undefined;
    }

    const paramObj = param as Record<string, unknown>;

    // Handle $ref
    if (typeof paramObj.$ref === "string") {
        const refPath = paramObj.$ref;
        if (visited.has(refPath)) {
            return undefined;
        }
        if (refPath.startsWith("#/components/parameters/")) {
            const paramName = refPath.substring("#/components/parameters/".length);
            const components = api.components as { parameters?: Record<string, unknown> } | undefined;
            const resolved = components?.parameters?.[paramName];
            if (resolved != null) {
                visited.add(refPath);
                return resolveParam(resolved, api, visited);
            }
        }
        // Try Swagger 2.0 style refs
        if (refPath.startsWith("#/parameters/")) {
            const paramName = refPath.substring("#/parameters/".length);
            const parameters = api.parameters as Record<string, unknown> | undefined;
            const resolved = parameters?.[paramName];
            if (resolved != null) {
                visited.add(refPath);
                return resolveParam(resolved, api, visited);
            }
        }
        return undefined;
    }

    if (typeof paramObj.in === "string" && typeof paramObj.name === "string") {
        const fernParameterName =
            typeof paramObj["x-fern-parameter-name"] === "string" ? paramObj["x-fern-parameter-name"] : undefined;
        return { in: paramObj.in, name: paramObj.name, fernParameterName };
    }

    return undefined;
}

/**
 * Resolves the inlined properties of an operation's request body into
 * ResolvedParam objects with `in: "body"`. SDK generators flatten an object
 * request body's properties into the same request wrapper as the path, query,
 * and header parameters, so these participate in the same name-collision check.
 *
 * Handles `$ref` request bodies, `$ref` schemas, and `allOf` composition. Only
 * top-level object properties are collected (these are what get flattened).
 */
function resolveRequestBodyProperties(
    requestBody: unknown,
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
    api: any,
    visited: Set<string> = new Set()
): ResolvedParam[] {
    if (typeof requestBody !== "object" || requestBody == null) {
        return [];
    }
    const requestBodyObj = requestBody as Record<string, unknown>;

    // Resolve a $ref to a component request body.
    if (typeof requestBodyObj.$ref === "string") {
        const refPath = requestBodyObj.$ref;
        if (visited.has(refPath)) {
            return [];
        }
        if (refPath.startsWith("#/components/requestBodies/")) {
            const name = refPath.substring("#/components/requestBodies/".length);
            const components = api.components as { requestBodies?: Record<string, unknown> } | undefined;
            const resolved = components?.requestBodies?.[name];
            if (resolved != null) {
                visited.add(refPath);
                return resolveRequestBodyProperties(resolved, api, visited);
            }
        }
        return [];
    }

    const content = requestBodyObj.content;
    if (typeof content !== "object" || content == null) {
        return [];
    }

    const properties = new Map<string, ResolvedParam>();
    for (const mediaType of Object.values(content as Record<string, unknown>)) {
        if (typeof mediaType !== "object" || mediaType == null) {
            continue;
        }
        const schema = (mediaType as Record<string, unknown>).schema;
        collectSchemaProperties(schema, api, properties, new Set());
    }
    return Array.from(properties.values());
}

/**
 * Collects the top-level object property names of a schema (resolving `$ref`
 * and merging `allOf` members) into `out`, keyed by property name.
 */
function collectSchemaProperties(
    schema: unknown,
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
    api: any,
    out: Map<string, ResolvedParam>,
    visited: Set<string>
): void {
    if (typeof schema !== "object" || schema == null) {
        return;
    }
    const schemaObj = schema as Record<string, unknown>;

    if (typeof schemaObj.$ref === "string") {
        const refPath = schemaObj.$ref;
        if (visited.has(refPath)) {
            return;
        }
        if (refPath.startsWith("#/components/schemas/")) {
            const name = refPath.substring("#/components/schemas/".length);
            const components = api.components as { schemas?: Record<string, unknown> } | undefined;
            const resolved = components?.schemas?.[name];
            if (resolved != null) {
                visited.add(refPath);
                collectSchemaProperties(resolved, api, out, visited);
            }
        }
        return;
    }

    // Merge properties contributed by allOf members (inheritance/composition).
    const allOf = schemaObj.allOf;
    if (Array.isArray(allOf)) {
        for (const member of allOf) {
            collectSchemaProperties(member, api, out, visited);
        }
    }

    const properties = schemaObj.properties;
    if (typeof properties === "object" && properties != null) {
        for (const [propName, propSchema] of Object.entries(properties as Record<string, unknown>)) {
            const fernParameterName =
                typeof propSchema === "object" &&
                propSchema != null &&
                typeof (propSchema as Record<string, unknown>)["x-fern-property-name"] === "string"
                    ? ((propSchema as Record<string, unknown>)["x-fern-property-name"] as string)
                    : undefined;
            out.set(propName, { in: "body", name: propName, fernParameterName });
        }
    }
}

/**
 * Merges path-level and operation-level parameters following the OpenAPI spec:
 * operation-level parameters override path-level parameters with the same
 * `in` + `name` combination.
 */
function mergeParameters(pathParams: ResolvedParam[], operationParams: ResolvedParam[]): ResolvedParam[] {
    const operationParamKeys = new Set(operationParams.map((p) => `${p.in}:${p.name}`));
    const merged = [...operationParams];
    for (const pathParam of pathParams) {
        const key = `${pathParam.in}:${pathParam.name}`;
        if (!operationParamKeys.has(key)) {
            merged.push(pathParam);
        }
    }
    return merged;
}

/**
 * Converts a parameter name to camelCase, matching the normalization
 * that SDK generators apply. Handles kebab-case, snake_case, and
 * PascalCase inputs.
 *
 * Examples:
 *   "Organization-Id"  → "organizationId"
 *   "organization_id"  → "organizationId"
 *   "Plant-Id"         → "plantId"
 *   "plant_id"         → "plantId"
 */
function toCamelCase(input: string): string {
    return input
        .replace(/[-_]+(.)?/g, (_, char: string | undefined) => (char != null ? char.toUpperCase() : ""))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}
