import { Rule, RuleViolation } from "../../Rule";

export const NoResponseAndResponsesRule: Rule = {
    name: "no-response-and-responses",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    const violations: RuleViolation[] = [];

                    const hasResponse = endpoint.response != null;
                    const hasResponses = endpoint.responses != null;

                    // Check for mutual exclusion between response and responses
                    if (hasResponse && hasResponses) {
                        violations.push({
                            severity: "fatal",
                            message:
                                "Cannot specify both 'response' and 'responses' on the same endpoint. The 'response' field is deprecated - use 'responses' instead."
                        });
                    }

                    // Validate unique status codes in responses array
                    if (hasResponses && Array.isArray(endpoint.responses)) {
                        const statusCodes: number[] = [];
                        const duplicateStatusCodes: number[] = [];

                        for (const responseItem of endpoint.responses) {
                            // Get status code - default to 200 if not specified or if it's a string
                            const statusCode =
                                typeof responseItem === "string" ? 200 : (responseItem["status-code"] ?? 200);

                            if (statusCodes.includes(statusCode)) {
                                if (!duplicateStatusCodes.includes(statusCode)) {
                                    duplicateStatusCodes.push(statusCode);
                                }
                            } else {
                                statusCodes.push(statusCode);
                            }
                        }

                        for (const duplicateCode of duplicateStatusCodes) {
                            violations.push({
                                severity: "fatal",
                                message: `Duplicate status code ${duplicateCode} in 'responses' array. Each status code must be unique.`
                            });
                        }
                    }

                    return violations;
                }
            }
        };
    }
};
