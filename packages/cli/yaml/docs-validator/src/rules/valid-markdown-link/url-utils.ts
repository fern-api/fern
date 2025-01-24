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

export {
    stripAnchorsAndSearchParams,
    removeLeadingSlash,
    addLeadingSlash,
    removeTrailingSlash,
    getInstanceUrls,
    toBaseUrl
};
