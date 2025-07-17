import { compile, match } from "path-to-regexp";
import urljoin from "url-join";

import { removeTrailingSlash } from "./url-utils";

// this is a copy of https://github.com/fern-api/fern-platform/blob/main/packages/ui/fern-docs-utils/src/getRedirectForPath.ts
// please keep in sync with that file

interface Redirect {
    destination: string;
    permanent: boolean;
}

/**
 * Match a path against a pattern, wrapped in a try-catch block to prevent crashes
 *
 * @param pattern path should follow path-to-regexp@6 syntax
 * @param path the current path to match against
 * @returns false if the path does not match the pattern, otherwise an object with the params and the path
 */
export function matchPath(pattern: string, path: string): ReturnType<ReturnType<typeof match>> {
    if (pattern === path) {
        return { params: {}, path, index: 0 };
    }
    try {
        return match(pattern)(path);
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: allow console
        console.error(e, { pattern, path });
        return false;
    }
}

function safeCompile(
    destination: string,
    match: Exclude<ReturnType<typeof matchPath>, false>
): ReturnType<ReturnType<typeof compile>> {
    try {
        return compile(destination)(match.params);
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: allow console
        console.error(e, { match, destination });
        return destination;
    }
}

export function getRedirectForPath(
    pathname: string,
    baseUrl: {
        domain: string;
        basePath?: string;
    },
    redirects: {
        source: string;
        destination: string;
        permanent?: boolean;
    }[] = []
): { redirect: Redirect } | undefined {
    for (const redirect of redirects) {
        const source = removeTrailingSlash(withBasepath(redirect.source, baseUrl.basePath));
        const result = matchPath(source, pathname);
        if (result) {
            const destination = safeCompile(redirect.destination, result);

            if (!destination.startsWith("/")) {
                try {
                    new URL(destination);
                } catch (e) {
                    // biome-ignore lint/suspicious/noConsole: allow console
                    console.error("Invalid redirect destination:", destination);
                    return undefined;
                }
            }

            // - Do NOT conform trailing slash in the destination because this relies on the user's direct configuration
            // - Do encode the URI to prevent any potential issues with special characters
            return { redirect: { destination: encodeURI(destination), permanent: redirect.permanent ?? false } };
        }
    }
    return undefined;
}

function withBasepath(source: string, basePath: string | undefined): string {
    return basePath == null ? source : source.startsWith(basePath) ? source : urljoin(basePath, source);
}
