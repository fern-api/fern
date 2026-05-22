import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3 } from "@fern-api/lazy-fern-workspace";

import { Rule } from "../../Rule.js";
import { ValidationViolation } from "../../ValidationViolation.js";

/**
 * Validates that OpenAPI specs don't define header parameters that conflict
 * with headers implied by security schemes.
 *
 * For example, if a spec has a Bearer Token security scheme (which implies
 * an Authorization header), and also declares an explicit "Authorization"
 * header parameter on a path, this rule will emit a warning.
 *
 * See: https://github.com/fern-api/fern/issues/6908
 */
export const NoDuplicateAuthHeaderParametersRule: Rule = {
    name: "no-duplicate-auth-header-parameters",
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

            const authHeaderNames = getAuthHeaderNames(apiToValidate);
            if (authHeaderNames.size === 0) {
                continue;
            }

            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            for (const [path, pathItem] of Object.entries(apiToValidate.paths ?? {})) {
                if (pathItem == null) {
                    continue;
                }

                const pathItemObj = pathItem as Record<string, unknown>;

                // Check path-level parameters
                const pathLevelParams = pathItemObj.parameters;
                if (Array.isArray(pathLevelParams)) {
                    for (const param of pathLevelParams) {
                        const resolved = resolveParam(param, apiToValidate);
                        if (resolved != null && isDuplicateAuthHeader(resolved, authHeaderNames)) {
                            violations.push({
                                name: "no-duplicate-auth-header-parameters",
                                severity: "warning",
                                relativeFilepath,
                                nodePath: ["paths", path, "parameters"],
                                message: `Header parameter '${resolved.name}' conflicts with the '${resolved.name}' header already defined by a security scheme. This parameter will be ignored during SDK generation.`
                            });
                        }
                    }
                }

                // Check operation-level parameters
                for (const method of ["get", "put", "post", "delete", "options", "head", "patch", "trace"]) {
                    const operation = pathItemObj[method] as { parameters?: unknown[] } | undefined;
                    if (operation?.parameters == null) {
                        continue;
                    }

                    for (const param of operation.parameters) {
                        const resolved = resolveParam(param, apiToValidate);
                        if (resolved != null && isDuplicateAuthHeader(resolved, authHeaderNames)) {
                            violations.push({
                                name: "no-duplicate-auth-header-parameters",
                                severity: "warning",
                                relativeFilepath,
                                nodePath: ["paths", path, method],
                                message: `Header parameter '${resolved.name}' conflicts with the '${resolved.name}' header already defined by a security scheme. This parameter will be ignored during SDK generation.`
                            });
                        }
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
 * Collects the set of header names (lowercased) implied by security schemes in the spec.
 */
function getAuthHeaderNames(
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
    api: any
): Set<string> {
    const headerNames = new Set<string>();
    const securitySchemes = api.components?.securitySchemes as Record<string, Record<string, unknown>> | undefined;

    if (securitySchemes == null) {
        return headerNames;
    }

    for (const scheme of Object.values(securitySchemes)) {
        if (typeof scheme !== "object" || scheme == null) {
            continue;
        }

        // Skip unresolved $ref
        if (typeof scheme.$ref === "string") {
            continue;
        }

        const type = scheme.type as string | undefined;

        if (type === "http") {
            // http schemes (basic, bearer, digest, etc.) use the Authorization header
            headerNames.add("authorization");
        } else if (type === "apiKey" && scheme.in === "header") {
            const name = scheme.name as string | undefined;
            if (name != null) {
                headerNames.add(name.toLowerCase());
            }
        } else if (type === "oauth2" || type === "openIdConnect") {
            // OAuth2 and OpenID Connect also use the Authorization header
            headerNames.add("authorization");
        }
    }

    return headerNames;
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
            return undefined; // Circular reference detected
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
        return undefined;
    }

    if (typeof paramObj.in === "string" && typeof paramObj.name === "string") {
        return { in: paramObj.in, name: paramObj.name };
    }

    return undefined;
}

/**
 * Checks if a resolved parameter is a header that conflicts with auth headers.
 */
function isDuplicateAuthHeader(param: ResolvedParam, authHeaderNames: Set<string>): boolean {
    return param.in === "header" && authHeaderNames.has(param.name.toLowerCase());
}
