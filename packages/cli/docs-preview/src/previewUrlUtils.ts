/**
 * Preview URLs follow the pattern: {org}-preview-{id}.docs.buildwithfern.com
 */
export const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

const DOMAIN_SUFFIX = "docs.buildwithfern.com";

/**
 * Maximum length of the full preview FQDN (subdomain + "." + DOMAIN_SUFFIX).
 * Not a DNS label limit — this is an application-level cap that must match
 * the server-side truncateDomainName logic in FDR.
 */
const PREVIEW_FQDN_LIMIT = 62;

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
    if (fullDomain.length <= PREVIEW_FQDN_LIMIT) {
        return fullDomain;
    }

    const prefix = `${orgId}-preview-`;
    const availableSpace = PREVIEW_FQDN_LIMIT - prefix.length;

    const minIdLength = 8;
    if (availableSpace < minIdLength) {
        throw new Error(`Organization name "${orgId}" is too long to generate a valid preview URL`);
    }

    const truncatedId = sanitizedId.slice(0, availableSpace).replace(/-+$/, "");
    return `${prefix}${truncatedId}.${DOMAIN_SUFFIX}`;
}
