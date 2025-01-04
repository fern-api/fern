import chalk from "chalk";

import { DEFAULT_REQUEST_PARAMETER_NAME } from "@fern-api/ir-generator";

import { Rule } from "../../Rule";

export const NoConflictingEndpointParametersRule: Rule = {
    name: "no-conflicting-endpoint-parameters",
    create: () => {
        return {
            definitionFile: {
                pathParameter: ({ pathParameterKey }) => {
                    if (pathParameterKey === DEFAULT_REQUEST_PARAMETER_NAME) {
                        return [
                            {
                                severity: "error",
                                message: `Path parameter ${chalk.bold(
                                    pathParameterKey
                                )} is not suitable for code generation, because it can conflict with the request body parameter.`
                            }
                        ];
                    } else {
                        return [];
                    }
                }
            }
        };
    }
};
