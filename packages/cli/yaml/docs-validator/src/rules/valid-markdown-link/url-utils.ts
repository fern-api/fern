import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsWorkspace } from "@fern-api/workspace-loader";

function stripAnchorsAndSearchParams(pathnameWithAnchorsOrSearchParams: string): string {
    return pathnameWithAnchorsOrSearchParams.split(/[?#]/)[0] ?? "";
}

function removeLeadingSlash(pathname: string): string {
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
}

function addLeadingSlash(pathname: string): string {
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function removeTrailingSlash(pathname: string): string {
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getInstanceUrls(workspace: DocsWorkspace): string[] {
    const urls: string[] = [];

    workspace.config.instances.forEach((instance) => {
        urls.push(instance.url);

        if (typeof instance.customDomain === "string") {
            urls.push(instance.customDomain);
        } else if (Array.isArray(instance.customDomain)) {
            urls.push(...instance.customDomain);
        }
    });

    return urls;
}

function toBaseUrl(domain: string): { domain: string; basePath: string | undefined } {
    const url = new URL(wrapWithHttps(domain));
    return {
        domain: url.host,
        basePath: url.pathname === "/" || url.pathname === "" ? undefined : url.pathname
    };
}

/**
 * Check if a URL's host matches any of the instance URLs.
 * This compares the actual host of the URL against the hosts of the instance URLs,
 * rather than doing a substring match which could incorrectly match URLs that
 * contain the instance URL in query parameters (e.g., ?source=docs.example.com).
 */
function urlMatchesInstanceHost(url: URL, instanceUrls: string[]): boolean {
    return instanceUrls.some((instanceUrl) => {
        try {
            const instanceBase = toBaseUrl(instanceUrl);
            // Check if the host matches
            if (url.host !== instanceBase.domain) {
                return false;
            }
            // If the instance has a base path, check if the URL pathname starts with it
            if (instanceBase.basePath != null) {
                return url.pathname.startsWith(instanceBase.basePath);
            }
            return true;
        } catch {
            return false;
        }
    });
}

export {
    stripAnchorsAndSearchParams,
    removeLeadingSlash,
    addLeadingSlash,
    removeTrailingSlash,
    getInstanceUrls,
    toBaseUrl,
    urlMatchesInstanceHost
};
