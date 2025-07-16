import type { Position } from "unist";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { RuleViolation } from "../../Rule";
import { safeCollectLinksAndSources } from "./collect-links";
import { stripAnchorsAndSearchParams } from "./url-utils";

// this should match any link that starts with a protocol (e.g. http://, https://, mailto:, etc.)
const EXTERNAL_LINK_PATTERN = /^(?:[a-z+]+:)/gi;

export interface PathnameToCheck {
    markdown: boolean;
    pathname: string;
    sourceFilepath?: AbsoluteFilePath;
    position?: Position;
}

function getFrontmatterOffset(content: string): number {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    if (!match) {
        return 0;
    }
    // Count the number of newlines in the frontmatter (including the --- lines)
    return (match[0].match(/\n/g) || []).length + 1;
}

function adjustedPosition(position: Position | undefined, frontmatterOffset: number): Position | undefined {
    return (
        position && {
            ...position,
            start: { ...position.start, line: position.start.line + frontmatterOffset },
            end: { ...position.end, line: position.end.line + frontmatterOffset }
        }
    );
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

    const frontmatterOffset = getFrontmatterOffset(content);
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
                    sourceFilepath: link.sourceFilepath,
                    position: adjustedPosition(link.position, frontmatterOffset),
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
            sourceFilepath: link.sourceFilepath,
            position: adjustedPosition(link.position, frontmatterOffset),
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
                sourceFilepath: source.sourceFilepath,
                position: adjustedPosition(source.position, frontmatterOffset),
                markdown: false
            });
        }
    });

    return {
        pathnamesToCheck,
        violations
    };
}
