import { CliError } from "@fern-api/task-context";

/**
 * Preview URLs follow the pattern: {org}-preview-{id}.docs.buildwithfern.com
 */
export const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

const DOMAIN_SUFFIX = "docs.buildwithfern.com";

/**
 * Application-level cap used in two ways:
 *   1. If the full domain fits within this length, return it unchanged.
 *   2. Otherwise, truncate the ID portion so the resulting subdomain label
 *      is at most this many characters (one under the DNS 63-char label limit).
 * Must match the server-side truncateDomainName logic in FDR.
 */
const SUBDOMAIN_LIMIT = 62;

export function isPreviewUrl(url: string): boolean {
    let hostname = url.toLowerCase().trim();

    if (hostname.startsWith("https://")) {
        hostname = hostname.slice(8);
    } else if (hostname.startsWith("http://")) {
        hostname = hostname.slice(7);
    }

    const slashIndex = hostname.indexOf("/");
    if (slashIndex !== -1) {
        hostname = hostname.slice(0, slashIndex);
    }

    return PREVIEW_URL_PATTERN.test(hostname);
}

/**
 * Sanitizes a preview ID to be valid in a DNS subdomain label.
 * This MUST match the server-side sanitizePreviewId in FDR.
 */
export function sanitizePreviewId(id: string): string {
    const sanitized = id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    if (sanitized.length === 0) {
        return "default";
    }
    return sanitized;
}

/**
 * Replicates the server-side truncateDomainName logic so the CLI can predict
 * the preview URL for a given previewId.
 */
export function buildPreviewDomain({ orgId, previewId }: { orgId: string; previewId: string }): string {
    const sanitizedId = sanitizePreviewId(previewId);
    const fullDomain = `${orgId}-preview-${sanitizedId}.${DOMAIN_SUFFIX}`;
    if (fullDomain.length <= SUBDOMAIN_LIMIT) {
        return fullDomain;
    }

    const prefix = `${orgId}-preview-`;
    const availableSpace = SUBDOMAIN_LIMIT - prefix.length;

    const minIdLength = 8;
    if (availableSpace < minIdLength) {
        throw new CliError({
            message: `Organization name "${orgId}" is too long to generate a valid preview URL`,
            code: CliError.Code.ValidationError
        });
    }

    const truncatedId = sanitizedId.slice(0, availableSpace).replace(/-+$/, "");
    return `${prefix}${truncatedId}.${DOMAIN_SUFFIX}`;
}
