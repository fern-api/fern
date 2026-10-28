import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import { parseErrorStatusCode, RawSchemas } from "@fern-api/fern-definition-schema";
import { noop } from "lodash-es";
import { visitDefinitionFileYamlAst } from "../../ast/index.js";
import { Rule, RuleViolation } from "../../Rule.js";

export const NoErrorStatusCodeConflictRule: Rule = {
    name: "no-error-status-code-conflict",
    create: ({ workspace }) => {
        if (workspace.definition.rootApiFile.contents["error-discrimination"]?.strategy !== "status-code") {
            return {};
        }
        const errorDeclarations = getErrorDeclarations(workspace);
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.errors == null) {
                        return [];
                    }
                    const statusCodeToError: Record<string, string[]> = {};
                    for (const error of endpoint.errors) {
                        const errorName = typeof error === "string" ? error : error.error;
                        const errorDeclaration = errorDeclarations[errorName];
                        if (errorDeclaration == null) {
                            continue;
                        }
                        const statusCode = getStatusCodeKey(errorDeclaration["status-code"]);
                        if (statusCode in statusCodeToError) {
                            statusCodeToError[statusCode]?.push(errorName);
                        } else {
                            statusCodeToError[statusCode] = [errorName];
                        }
                    }
                    const result: RuleViolation[] = [];
                    for (const [statusCode, errorNames] of Object.entries(statusCodeToError)) {
                        if (errorNames.length > 1) {
                            result.push({
                                severity: "fatal",
                                message: `Multiple errors have status-code ${statusCode}: ${errorNames.join(", ")}`
                            });
                        }
                    }
                    return result;
                }
            }
        };
    }
};

/**
 * Concrete status codes are normalized to their number; wildcards keep their
 * pattern (e.g. "4XX") so that a concrete 404 and a 4XX never conflict.
 */
function getStatusCodeKey(statusCode: RawSchemas.ErrorStatusCodeSchema): string {
    const parsed = parseErrorStatusCode(statusCode);
    if (parsed == null) {
        return String(statusCode);
    }
    return parsed.isWildcard ? String(statusCode).toUpperCase() : parsed.statusCode.toString();
}

function getErrorDeclarations(workspace: FernWorkspace): Record<string, RawSchemas.ErrorDeclarationSchema> {
    const errorDeclarations: Record<string, RawSchemas.ErrorDeclarationSchema> = {};
    visitAllDefinitionFiles(workspace, (_relativeFilepath, file) => {
        visitDefinitionFileYamlAst(file, {
            typeName: noop,
            errorDeclaration: ({ errorName, declaration }) => {
                errorDeclarations[errorName] = declaration;
            },
            httpService: noop
        });
    });
    return errorDeclarations;
}
