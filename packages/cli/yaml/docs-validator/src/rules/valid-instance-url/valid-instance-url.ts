import { Rule, RuleViolation } from "../../Rule";

const VALID_FERN_DOMAINS = ["docs.buildwithfern.com", "docs.buildwithfern.com"];
const MAX_SUBDOMAIN_LENGTH = 62;

function validateSubdomain(subdomain: string): { valid: boolean; error?: string; suggestion?: string } {
    // Check for dots in subdomain
    if (subdomain.includes(".")) {
        return {
            valid: false,
            error: `Subdomain "${subdomain}" contains a '.' character, which is not allowed`,
            suggestion: subdomain.replace(/\./g, "-")
        };
    }

    // Check subdomain length
    if (subdomain.length > MAX_SUBDOMAIN_LENGTH) {
        return {
            valid: false,
            error: `Subdomain "${subdomain}" is ${subdomain.length} characters long, which exceeds the maximum of ${MAX_SUBDOMAIN_LENGTH} characters`
        };
    }

    // Check for invalid URL characters
    // Valid subdomain characters: alphanumeric and hyphens, cannot start or end with hyphen
    const validSubdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    if (!validSubdomainRegex.test(subdomain)) {
        return {
            valid: false,
            error: `Subdomain "${subdomain}" contains invalid characters. Subdomains must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen`
        };
    }

    return { valid: true };
}

function validateInstanceUrl(url: string): RuleViolation | null {
    // Parse the URL to extract subdomain and domain
    let hostname: string;
    try {
        // Handle URLs with or without protocol
        const urlWithProtocol = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
        const parsedUrl = new URL(urlWithProtocol);
        hostname = parsedUrl.hostname;
    } catch (e) {
        return {
            severity: "fatal",
            message: `Invalid URL format: "${url}". Expected format: <subdomain>.docs.buildwithfern.com`
        };
    }

    // Check if the URL ends with a valid Fern domain
    const matchedDomain = VALID_FERN_DOMAINS.find((domain) => hostname.endsWith(domain));
    if (!matchedDomain) {
        return {
            severity: "fatal",
            message: `Invalid domain in URL "${url}". The URL must end with one of: ${VALID_FERN_DOMAINS.join(", ")}`
        };
    }

    // Extract subdomain
    const subdomain = hostname.slice(0, hostname.length - matchedDomain.length - 1); // -1 for the dot

    // Validate subdomain is not empty
    if (!subdomain || subdomain.length === 0) {
        return {
            severity: "fatal",
            message: `Invalid URL "${url}". A subdomain is required before ${matchedDomain}`
        };
    }

    // Validate subdomain constraints
    const validation = validateSubdomain(subdomain);
    if (!validation.valid) {
        let message = `Invalid instance URL "${url}": ${validation.error}`;
        if (validation.suggestion) {
            message += `. Suggestion: ${validation.suggestion}.${matchedDomain}`;
        }
        return {
            severity: "fatal",
            message
        };
    }

    return null;
}

export const ValidInstanceUrlRule: Rule = {
    name: "valid-instance-url",
    create: () => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];

                if (!config.instances || config.instances.length === 0) {
                    return violations;
                }

                for (let i = 0; i < config.instances.length; i++) {
                    const instance = config.instances[i];
                    if (instance?.url) {
                        const violation = validateInstanceUrl(instance.url);
                        if (violation) {
                            violations.push({
                                ...violation,
                                message: `instances[${i}].url: ${violation.message}`
                            });
                        }
                    }
                }

                return violations;
            }
        };
    }
};
