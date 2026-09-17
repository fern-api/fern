import { Rule, RuleViolation } from "../../Rule.js";

// A CSP frame-ancestors host source: scheme://host[:port], where the host may start with a `*.` wildcard label.
const HOST_LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?";
const EMBEDDING_ORIGIN_REGEX = new RegExp(`^https?://(?:\\*\\.)?${HOST_LABEL}(?:\\.${HOST_LABEL})*(?::\\d{1,5})?$`);

export function validateEmbeddingOrigin(origin: string): string | undefined {
    if (origin.trim() !== origin || origin.length === 0) {
        return `Origin "${origin}" must not be empty or contain surrounding whitespace`;
    }
    if (origin === "*" || origin.startsWith("*")) {
        return `Origin "${origin}" is not allowed: a bare wildcard would let any site embed your docs. Use a scoped wildcard such as https://*.example.com instead`;
    }
    if (!EMBEDDING_ORIGIN_REGEX.test(origin)) {
        return `Origin "${origin}" is not a valid origin. Expected scheme://host[:port] with no path, query, or CSP keywords, e.g. https://app.example.com or https://*.example.com`;
    }
    return undefined;
}

export const ValidEmbeddingOriginsRule: Rule = {
    name: "valid-embedding-origins",
    create: () => {
        return {
            file: async ({ config }) => {
                const origins = config.settings?.embedding?.allowedOrigins;
                if (origins == null) {
                    return [];
                }

                const violations: RuleViolation[] = [];
                origins.forEach((origin, index) => {
                    const error = validateEmbeddingOrigin(origin);
                    if (error != null) {
                        violations.push({
                            severity: "fatal",
                            message: `settings.embedding.allowed-origins[${index}]: ${error}`
                        });
                    }
                });
                return violations;
            }
        };
    }
};
