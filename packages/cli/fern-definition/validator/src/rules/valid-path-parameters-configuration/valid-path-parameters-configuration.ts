import { Rule } from "../../Rule";

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
                                severity: "fatal",
                                message: "path-parameters cannot be defined in both endpoint and request."
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
