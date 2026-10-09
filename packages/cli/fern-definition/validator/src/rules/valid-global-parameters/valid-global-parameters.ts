import { Rule, RuleViolation } from "../../Rule.js";

const VALID_LOCATIONS = new Set(["body", "query", "header", "path"]);
const VALID_APPLY_MODES = new Set(["explicit", "auto"]);
const VALID_TYPES = new Set(["string", "integer", "double", "number", "boolean"]);

export const ValidGlobalParametersRule: Rule = {
    name: "valid-global-parameters",
    create: ({ workspace }) => {
        const rootGlobalParams = workspace.definition.rootApiFile.contents["global-parameters"];
        const declaredIds = rootGlobalParams != null ? new Set(Object.keys(rootGlobalParams)) : new Set<string>();

        return {
            rootApiFile: {
                file: () => {
                    if (rootGlobalParams == null) {
                        return [];
                    }
                    const violations: RuleViolation[] = [];
                    for (const [key, param] of Object.entries(rootGlobalParams)) {
                        if (param.in != null && !VALID_LOCATIONS.has(param.in)) {
                            violations.push({
                                severity: "error",
                                message: `Global parameter '${key}' has invalid location '${param.in}'; expected one of: body, query, header, path`
                            });
                        }
                        if (param.apply != null && !VALID_APPLY_MODES.has(param.apply)) {
                            violations.push({
                                severity: "error",
                                message: `Global parameter '${key}' has invalid apply mode '${param.apply}'; expected one of: explicit, auto`
                            });
                        }
                        if (param.type != null && !VALID_TYPES.has(param.type)) {
                            violations.push({
                                severity: "warning",
                                message: `Global parameter '${key}' has unknown type '${param.type}'; expected one of: string, integer, double, number, boolean. Defaulting to string.`
                            });
                        }
                    }
                    return violations;
                }
            },
            definitionFile: {
                httpEndpoint: ({ endpointId, endpoint }) => {
                    const epGlobalParams = endpoint["global-parameters"];
                    if (epGlobalParams == null) {
                        return [];
                    }
                    const violations: RuleViolation[] = [];
                    for (const id of epGlobalParams) {
                        if (!declaredIds.has(id)) {
                            violations.push({
                                severity: "error",
                                message:
                                    `Endpoint '${endpointId}' references undeclared global parameter '${id}'. ` +
                                    `Declared parameters: ${declaredIds.size > 0 ? [...declaredIds].join(", ") : "(none)"}`
                            });
                        }
                    }
                    return violations;
                }
            }
        };
    }
};
