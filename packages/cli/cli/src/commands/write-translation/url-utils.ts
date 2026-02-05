import { docsYml } from "@fern-api/configuration";

type Language = docsYml.RawSchemas.Language;

/**
 * Adds a language prefix to a URL using subdomain format.
 * @param url - The original URL
 * @param language - The language to add as a subdomain prefix
 * @returns The URL with the language prefix in the subdomain
 * @example
 * - "https://org.docs.buildwithfern.com" -> "https://org-de.docs.buildwithfern.com"
 * - "https://docs.custom.com" -> "https://de.docs.custom.com"
 * - "https://docs.custom.com/path" -> "https://de.docs.custom.com/path"
 */
export function addLanguageSuffixToUrl(url: string, language: Language): string {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const originalHasTrailingSlash = url.endsWith("/");

        if (hostname.includes(".docs.buildwithfern.com")) {
            const org = hostname.split(".")[0];
            urlObj.hostname = `${org}-${language}.docs.buildwithfern.com`;
            urlObj.pathname = `/${language}${urlObj.pathname}`;
        } else {
            urlObj.hostname = `${language}.${hostname}`;
            urlObj.pathname = `/${language}${urlObj.pathname}`;
        }

        let result = urlObj.toString();

        if (!originalHasTrailingSlash && result.endsWith("/")) {
            // only remove trailing slash if the pathname is just the language (e.g., "/de/")
            if (urlObj.pathname === `/${language}/`) {
                result = result.slice(0, -1);
            }
        }

        return result;
    } catch {
        // fallback parsing for invalid URLs
        const originalHasTrailingSlash = url.endsWith("/");
        if (url.includes("://")) {
            const [protocol, rest] = url.split("://");
            const [hostAndPath, ...fragments] = rest?.split("#") ?? [];
            const [hostAndQuery, ...hashParts] = hostAndPath?.split("?") ?? [];
            const [hostname, ...pathParts] = hostAndQuery?.split("/") ?? [];

            if (!hostname) {
                return url;
            }

            let newHostname: string;
            if (hostname.includes(".docs.buildwithfern.com")) {
                const orgPart = hostname.split(".")[0];
                newHostname = `${orgPart}-${language}.docs.buildwithfern.com/${language}`;
            } else {
                newHostname = `${language}.${hostname}/${language}`;
            }

            let result = `${protocol}://${newHostname}`;
            if (pathParts.length > 0) {
                result += "/" + pathParts.join("/");
            } else if (originalHasTrailingSlash) {
                result += "/";
            }
            if (hashParts.length > 0) {
                result += "?" + hashParts.join("?");
            }
            if (fragments.length > 0) {
                result += "#" + fragments.join("#");
            }

            return result;
        } else {
            if (url.includes("/")) {
                const parts = url.split("/");
                const hostname = parts[0];
                const pathParts = parts.slice(1);

                let newHostname: string;
                if (hostname?.includes(".docs.buildwithfern.com")) {
                    const orgPart = hostname.split(".")[0];
                    newHostname = `${orgPart}-${language}.docs.buildwithfern.com/${language}`;
                } else {
                    newHostname = `${language}.${hostname}/${language}`;
                }

                if (pathParts.length > 0 || pathParts.some((p) => p !== "")) {
                    return `${newHostname}/${pathParts.join("/")}`;
                } else if (originalHasTrailingSlash) {
                    return `${newHostname}/`;
                } else {
                    return newHostname;
                }
            } else {
                if (url.includes(".docs.buildwithfern.com")) {
                    const orgPart = url.split(".")[0];
                    return `${orgPart}-${language}.docs.buildwithfern.com/${language}`;
                } else {
                    return `${language}.${url}/${language}`;
                }
            }
        }
    }
}
