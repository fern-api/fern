import { docsYml } from "@fern-api/configuration";

import { Rule } from "../../Rule.js";

export const ValidContentSecurityPolicyRule: Rule = {
    name: "valid-content-security-policy",
    create: () => {
        return {
            file: async ({ config }) => {
                return docsYml
                    .getContentSecurityPolicyErrors(config.settings?.contentSecurityPolicy?.styleHashes)
                    .map((message) => ({ severity: "fatal", message }));
            }
        };
    }
};
