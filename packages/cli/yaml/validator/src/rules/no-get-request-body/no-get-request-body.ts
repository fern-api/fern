import { Rule, RuleViolation } from "../../Rule";

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    create: () => {
        return {
            httpService: (service) => {
                const violations: RuleViolation[] = [];
                for (const [endpointId, endpoint] of Object.entries(service.service.endpoints)) {
                    if (endpoint.method === "GET" && endpoint.request != null) {
                        violations.push({
                            severity: "error",
                            message: `Endpoint '${endpointId}' is a GET request, so it cannot have a request body.`,
                        });
                    }
                }
                return violations;
            },
        };
    },
};
