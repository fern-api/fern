import { AuthSchema } from "@fern-api/yaml-schema/src/schemas";
import chalk from "chalk";
import { Rule } from "../../Rule";

export const ValidAuthInServiceRule: Rule = {
    name: "valid-auth-in-service",
    create: () => {
        return {
            httpService: ({ service, serviceName }) => {
                const uniqueAuths = new Set<AuthSchema>();
                for (const endpointId of Object.keys(service.endpoints)) {
                    const httpEndpoint = service.endpoints[endpointId];
                    const actualAuth = httpEndpoint?.["auth-override"] ?? service.auth;
                    uniqueAuths.add(actualAuth);
                }
                if (uniqueAuths.has("bearer") && uniqueAuths.has("basic")) {
                    return [
                        {
                            severity: "error",
                            message: `Service ${chalk.bold(
                                serviceName
                            )} has endpoints with both bearer and basic auth. Only one of the two can be used.`,
                        },
                    ];
                }
                return [];
            },
        };
    },
};
