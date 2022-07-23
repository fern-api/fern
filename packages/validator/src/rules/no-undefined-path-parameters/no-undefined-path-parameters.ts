import { constructHttpPath } from "@fern-api/ir-generator";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const NoUndefinedPathParametersRule: Rule = {
    name: "no-undefined-path-parameters",
    create: () => {
        return {
            httpEndpoint: ({ endpoint }) => {
                const errors: RuleViolation[] = [];

                const urlPathParameters = new Set();
                if (endpoint.path != null) {
                    const httpPath = constructHttpPath(endpoint.path);
                    httpPath.parts.forEach((part) => {
                        if (urlPathParameters.has(part.pathParameter)) {
                            errors.push({
                                severity: "error",
                                message: `Endpoint path has duplicate path parameter: ${chalk.bold(
                                    part.pathParameter
                                )}.`,
                            });
                        }
                        urlPathParameters.add(part.pathParameter);
                    });
                }

                const definedPathParameters = new Set(Object.keys(endpoint["path-parameters"] ?? {}));

                // path parameters present in the url but are not defined
                const undefinedPathParameters = getDifference(urlPathParameters, definedPathParameters);
                undefinedPathParameters.forEach((pathParameter) => {
                    errors.push({
                        severity: "error",
                        message: `Endpoint is missing path-parameter: ${chalk.bold(pathParameter)}.`,
                    });
                });

                // path parameters that are defined but not present in the url
                const missingUrlPathParameters = getDifference(definedPathParameters, urlPathParameters);
                missingUrlPathParameters.forEach((pathParameter) => {
                    errors.push({
                        severity: "error",
                        message: `Endpoint path has unused path-parameter: ${chalk.bold(pathParameter)}.`,
                    });
                });

                return errors;
            },
        };
    },
};

function getDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA].filter((element) => !setB.has(element)));
}
