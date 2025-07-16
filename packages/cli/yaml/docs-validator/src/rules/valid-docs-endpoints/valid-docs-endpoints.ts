import { Rule, RuleViolation } from "../../Rule";

export const ValidDocsEndpoints: Rule = {
    name: "valid-docs-endpoints",
    create: () => ({
        file: async ({ config }) => {
            // Ignore empty analytics config
            if (!config.analytics || !Object.keys(config.analytics).length) {
                return [];
            }

            // Add each endpoint that should be included in this rule here
            const endpoints = [
                [config.analytics.intercom?.apiBase, "Intercom API Base"],
                [config.analytics.posthog?.endpoint, "Posthog Host Endpoint"]
            ];

            const violations = endpoints
                .filter(([endpoint]) => endpoint && !validEndpoint(endpoint))
                .map(([endpoint, name]): RuleViolation => {
                    return {
                        severity: "warning",
                        message: `${name} <${endpoint}> is malformed. Make sure it includes a protocol (e.g. 'https://')!`
                    };
                });

            return violations;
        }
    })
};

export function validEndpoint(endpoint: string): boolean {
    try {
        const url = new URL(endpoint);
        return Boolean(url.protocol);
    } catch (e) {
        return false;
    }
}
