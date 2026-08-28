import { CliError } from "@fern-api/task-context";

const DOCS_DOMAIN_SUFFIX_ENV_VAR = "DOCS_DOMAIN_SUFFIX";

/**
 * Production suffix. Matches FDR's own fallback for the `DOMAIN_SUFFIX` variable
 * that drives server-side preview-host generation, so an unconfigured CLI and an
 * unconfigured registry agree.
 */
const DEFAULT_DOCS_DOMAIN_SUFFIX = "docs.buildwithfern.com";

/**
 * Application-level cap used in two ways:
 *   1. If the full domain fits within this length, return it unchanged.
 *   2. Otherwise, truncate the ID portion so the resulting subdomain label
 *      is at most this many characters (one under the DNS 63-char label limit).
 * Must match the server-side truncateDomainName logic in FDR.
 */
const SUBDOMAIN_LIMIT = 62;

/**
 * The docs domain previews are published under.
 *
 * FDR generates preview hosts as `{org}-preview-{id}.{domainSuffix}`, where
 * `domainSuffix` comes from its `DOMAIN_SUFFIX` environment variable — so the
 * suffix is `docs.buildwithfern.com` in production but `docs.dev.buildwithfern.com`
 * against a dev registry. The CLI predicts that host locally (see
 * {@link buildPreviewDomain}) and validates pasted ones against it, so it has to
 * be told which environment it is pointed at or it will construct prod hosts for
 * dev previews and fail to resolve them.
 *
 * Read as an override with a production default rather than a required variable:
 * every existing invocation runs without it set, and `DOCS_DOMAIN_SUFFIX` is
 * already consumed this way elsewhere in the CLI (see the domain hint in
 * `publishDocs.ts`).
 */
export function getDocsDomainSuffix(): string {
    const configured = process.env[DOCS_DOMAIN_SUFFIX_ENV_VAR]?.trim();
    if (configured == null || configured === "") {
        return DEFAULT_DOCS_DOMAIN_SUFFIX;
    }
    // Tolerate a leading/trailing dot so `.docs.dev.buildwithfern.com` and
    // `docs.dev.buildwithfern.com` are equivalent; the separator is added by the
    // callers that interpolate this.
    return configured.replace(/^\.+/, "").replace(/\.+$/, "");
}

function escapeForRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches a preview host for the configured environment:
 * `{org}-preview-{id}.{suffix}` — e.g. `acme-preview-abc123.docs.buildwithfern.com`,
 * or `...docs.dev.buildwithfern.com` when `DOCS_DOMAIN_SUFFIX` points at dev.
 *
 * The suffix is escaped before interpolation, so its dots match literal dots
 * rather than any character.
 */
export function getPreviewUrlPattern(): RegExp {
    return new RegExp(`^[a-z0-9-]+-preview-[a-z0-9-]+\\.${escapeForRegExp(getDocsDomainSuffix())}$`, "i");
}

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

    return getPreviewUrlPattern().test(hostname);
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
    const domainSuffix = getDocsDomainSuffix();
    const sanitizedId = sanitizePreviewId(previewId);
    const fullDomain = `${orgId}-preview-${sanitizedId}.${domainSuffix}`;
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
    return `${prefix}${truncatedId}.${domainSuffix}`;
}
