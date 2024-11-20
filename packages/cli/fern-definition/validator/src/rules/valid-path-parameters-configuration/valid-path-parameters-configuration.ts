import { constructHttpPath } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import chalk from "chalk";
import capitalize from "lodash-es/capitalize";
import { Rule, RuleViolation } from "../../Rule";
import urlJoin from "url-join";

export const ValidPathParametersConfigurationRule: Rule = {
    name: "valid-path-parameters-configuration",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (
                        endpoint["path-parameters"] != null &&
                        typeof endpoint.request !== "string" &&
                        endpoint?.request?.["path-parameters"] != null
                    ) {
                        return [
                            {
                                severity: "error",
                                message: "Endpoint has path-parameters defined in both endpoint and request."
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
