import { CliError, TaskContext } from "@fern-api/task-context";

const HTTPS_PREFIX = "https://";
const HTTP_PREFIX = "http://";

/**
 * Strips a leading `https://` or `http://` from a custom domain string.
 */
export function stripCustomDomainProtocol(customDomain: string): string {
    if (customDomain.startsWith(HTTPS_PREFIX)) {
        return customDomain.slice(HTTPS_PREFIX.length);
    }
    if (customDomain.startsWith(HTTP_PREFIX)) {
        return customDomain.slice(HTTP_PREFIX.length);
    }
    return customDomain;
}

/**
 * Extracts the basepath (URL pathname) from a domain string. Trailing slashes
 * are stripped (except for the root) so `/docs` and `/docs/` compare equal.
 */
export function getBasepath(domain: string): string {
    try {
        const url =
            domain.startsWith(HTTPS_PREFIX) || domain.startsWith(HTTP_PREFIX) ? domain : `${HTTPS_PREFIX}${domain}`;
        return normalizeBasepath(new URL(url).pathname);
    } catch {
        return "/";
    }
}

function normalizeBasepath(pathname: string): string {
    if (pathname === "" || pathname === "/") {
        return "/";
    }
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * Validates that the Fern instance URL and every custom domain share the same
 * basepath when basepath-aware mode is enabled (via `multi-source: true` or
 * the deprecated `experimental.basepath-aware: true`).
 *
 * Without this check, docs published under a Fern URL with one basepath but
 * fronted by a custom domain with a different basepath will 404 after the
 * customer's DNS cutover, since the basepath-aware S3 keys won't line up.
 */
export function validateBasepathAlignment(
    instanceUrl: string,
    customDomains: readonly string[],
    context: TaskContext
): void {
    const urlBasepath = getBasepath(instanceUrl);
    for (const customDomain of customDomains) {
        const customDomainBasepath = getBasepath(customDomain);
        if (urlBasepath !== customDomainBasepath) {
            context.failAndThrow(
                `Basepath mismatch between Fern url and custom-domain. When basepath-aware mode is enabled ` +
                    `(via 'multi-source: true' or the deprecated 'experimental.basepath-aware: true'), the ` +
                    `instance 'url' and 'custom-domain' must share the same basepath, otherwise docs will ` +
                    `fail to resolve after DNS cutover. Instance url '${instanceUrl}' has basepath ` +
                    `'${urlBasepath}' but custom-domain '${customDomain}' has basepath '${customDomainBasepath}'.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
    }
}
