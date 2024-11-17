import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Position } from "unist";
import { RuleViolation } from "../../Rule";
import { safeCollectLinksAndSources } from "./collect-links";
import { stripAnchorsAndSearchParams } from "./url-utils";

// this should match any link that starts with a protocol (e.g. http://, https://, mailto:, etc.)
const EXTERNAL_LINK_PATTERN = /^(?:[a-z+]+:)/gi;

export interface PathnameToCheck {
    markdown: boolean;
    pathname: string;
    position?: Position;
}

export function collectPathnamesToCheck(
    content: string,
    {
        absoluteFilepath,
        instanceUrls
    }: {
        absoluteFilepath?: AbsoluteFilePath;
        instanceUrls: string[];
    }
): {
    pathnamesToCheck: PathnameToCheck[];
    violations: RuleViolation[];
} {
    const violations: RuleViolation[] = [];
    const pathnamesToCheck: PathnameToCheck[] = [];

    const { links, sources } = safeCollectLinksAndSources({ content, absoluteFilepath });

    links.forEach((link) => {
        if (link.href.trimStart().match(EXTERNAL_LINK_PATTERN)) {
            if (!link.href.trimStart().startsWith("http")) {
                // we don't need to check if it exists if it's not an http link
                return;
            }

            try {
                // test if the link is a valid WHATWG URL (otherwise `new URL(link.href)` will throw)
                const url = new URL(link.href);

                // if the link does not point to an instance URL, we don't need to check if it exists internally
                if (!instanceUrls.some((url) => link.href.includes(url))) {
                    // TODO: potentially do a `fetch` check here to see if the external link is valid?
                    return;
                }

                pathnamesToCheck.push({
                    pathname: url.pathname,
                    position: link.position,
                    markdown: true
                });
            } catch (error) {
                violations.push({
                    severity: "warning",
                    message: `Invalid URL: ${link.href}`
                });
            }
            return;
        }

        const pathname = stripAnchorsAndSearchParams(link.href);

        // empty "" is actually a valid path, so we don't need to check it
        if (pathname.trim() === "") {
            return;
        }

        pathnamesToCheck.push({
            pathname,
            position: link.position,
            markdown: true
        });
    });

    sources.forEach((source) => {
        if (source.src.match(EXTERNAL_LINK_PATTERN)) {
            try {
                // test if the link is a valid WHATWG URL (otherwise `new URL(source.src)` will throw)
                new URL(source.src);
            } catch (error) {
                violations.push({
                    severity: "warning" as const,
                    message: `Invalid URL: ${source.src}`
                });
                return;
            }
        } else {
            pathnamesToCheck.push({
                pathname: source.src,
                position: source.position,
                markdown: false
            });
        }
    });

    return {
        pathnamesToCheck,
        violations
    };
}
