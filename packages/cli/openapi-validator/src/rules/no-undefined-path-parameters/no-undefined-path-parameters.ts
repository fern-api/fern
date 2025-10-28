import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoUndefinedPathParametersRule: Rule = {
    name: "no-undefined-path-parameters",
    description: "Validates that all path parameters in URLs are defined in the parameters array",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-undefined-path-parameters.ts:validate:11:9] Starting no-undefined-path-parameters validation | ${JSON.stringify(
                {
                    file: "no-undefined-path-parameters.ts",
                    function: "validate",
                    line: 11,
                    column: 9,
                    state: {
                        pathCount: Object.keys(document.paths || {}).length
                    }
                }
            )}`
        );

        const violations: RuleViolation[] = [];

        if (!document.paths) {
            return violations;
        }

        for (const [path, pathItem] of Object.entries(document.paths)) {
            if (!pathItem || "$ref" in pathItem) {
                continue;
            }

            const pathItemObj = pathItem as OpenAPIV3_1.PathItemObject;

            const pathParamsInUrl = new Set<string>();
            const paramMatches = path.matchAll(/\{([^}]+)\}/g);
            for (const match of paramMatches) {
                const paramName = match[1];
                if (paramName) {
                    pathParamsInUrl.add(paramName);
                }
            }

            const operations: Array<[string, OpenAPIV3_1.OperationObject | undefined]> = [
                ["get", pathItemObj.get],
                ["post", pathItemObj.post],
                ["put", pathItemObj.put],
                ["patch", pathItemObj.patch],
                ["delete", pathItemObj.delete],
                ["options", pathItemObj.options],
                ["head", pathItemObj.head],
                ["trace", pathItemObj.trace]
            ];

            for (const [method, operation] of operations) {
                if (!operation) {
                    continue;
                }

                const definedParams = new Set<string>();

                if (pathItemObj.parameters) {
                    for (const param of pathItemObj.parameters) {
                        if ("$ref" in param) {
                            continue;
                        }
                        const paramObj = param as OpenAPIV3_1.ParameterObject;
                        if (paramObj.in === "path") {
                            definedParams.add(paramObj.name);
                        }
                    }
                }

                if (operation.parameters) {
                    for (const param of operation.parameters) {
                        if ("$ref" in param) {
                            continue;
                        }
                        const paramObj = param as OpenAPIV3_1.ParameterObject;
                        if (paramObj.in === "path") {
                            definedParams.add(paramObj.name);
                        }
                    }
                }

                for (const paramName of pathParamsInUrl) {
                    if (!definedParams.has(paramName)) {
                        logger.debug(
                            `[no-undefined-path-parameters.ts:validate:95:25] Undefined path parameter found | ${JSON.stringify(
                                {
                                    file: "no-undefined-path-parameters.ts",
                                    function: "validate",
                                    line: 95,
                                    column: 25,
                                    state: { path, method, paramName }
                                }
                            )}`
                        );
                        violations.push({
                            severity: "error",
                            message: `[no-undefined-path-parameters] Path parameter '{${paramName}}' in '${path}' is not defined in ${method.toUpperCase()} operation parameters`,
                            path: `${path}/${method}/parameters`
                        });
                    }
                }

                for (const paramName of definedParams) {
                    if (!pathParamsInUrl.has(paramName)) {
                        logger.debug(
                            `[no-undefined-path-parameters.ts:validate:114:25] Unused path parameter found | ${JSON.stringify(
                                {
                                    file: "no-undefined-path-parameters.ts",
                                    function: "validate",
                                    line: 114,
                                    column: 25,
                                    state: { path, method, paramName }
                                }
                            )}`
                        );
                        violations.push({
                            severity: "warning",
                            message: `[no-undefined-path-parameters] Path parameter '${paramName}' is defined but not used in path '${path}'`,
                            path: `${path}/${method}/parameters`
                        });
                    }
                }
            }
        }

        logger.debug(
            `[no-undefined-path-parameters.ts:validate:132:9] No-undefined-path-parameters validation complete | ${JSON.stringify(
                {
                    file: "no-undefined-path-parameters.ts",
                    function: "validate",
                    line: 132,
                    column: 9,
                    state: {
                        violationCount: violations.length
                    }
                }
            )}`
        );

        return violations;
    }
};
