import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3 } from "@fern-api/lazy-fern-workspace";

import { Rule } from "../../Rule.js";
import { ValidationViolation } from "../../ValidationViolation.js";

/**
 * Validates that OpenAPI specs don't define header parameters whose
 * camelCase-normalized names collide with query or path parameters on
 * the same endpoint.
 *
 * When a path-level or operation-level header (e.g. `Organization-Id`)
 * normalizes to the same camelCase name as a query or path parameter
 * (e.g. `organization_id`), SDK generators produce broken code:
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
                    const operation = pathItemObj[method] as { parameters?: unknown[] } | undefined;
                    if (operation == null) {
                        continue;
                    }

                    // Collect operation-level parameters
                    const operationParams = resolveAllParams(operation.parameters, apiToValidate);

                    // Merge path-level and operation-level parameters.
                    // Operation-level params override path-level params with the same `in` + `name`.
                    const mergedParams = mergeParameters(pathLevelParams, operationParams);

                    // Group parameters by their camelCase-normalized name
                    const nameToParams: Record<string, ResolvedParam[]> = {};
                    for (const param of mergedParams) {
                        const normalizedName = toCamelCase(param.name);
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

                        const paramDescriptions = params.map((p) => `${p.in} parameter '${p.name}'`).join(", ");

                        violations.push({
                            name: "no-conflicting-parameter-names",
                            severity: "error",
                            relativeFilepath,
                            nodePath: ["paths", path, method],
                            message:
                                `Parameters ${paramDescriptions} all normalize to '${normalizedName}' in generated SDKs. ` +
                                `This causes broken code (duplicate keyword arguments in Python, duplicate properties in TypeScript). ` +
                                `Rename one of the parameters to avoid the collision.`
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
        return { in: paramObj.in, name: paramObj.name };
    }

    return undefined;
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
