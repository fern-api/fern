import { docsYml } from "@fern-api/configuration";

import { Rule } from "../../Rule.js";

export const ValidEmbeddingOriginsRule: Rule = {
    name: "valid-embedding-origins",
    create: () => {
        return {
            file: async ({ config }) => {
                const origins = config.settings?.embedding?.allowedOrigins;
                if (origins == null) {
                    return [];
                }

                return docsYml.getEmbeddingOriginErrors(origins).map((message) => ({ severity: "fatal", message }));
            }
        };
    }
};
