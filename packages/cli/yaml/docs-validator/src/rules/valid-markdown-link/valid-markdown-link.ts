import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist, join } from "@fern-api/fs-utils";

import { Rule, RuleViolation } from "../../Rule";

const LINK_PATTERN = /\[([^\]]+)\]\(((?!http:\/\/|https:\/\/).*?)\)/gi;

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: () => {
        return {
            markdownPage: async ({ content, absoluteFilepath }) => {
                // Find all matches in the Markdown text
                const violations: RuleViolation[] = [];

                const links = getReferencedMarkdownFiles({ content, absoluteFilepath });

                for (const link of links) {
                    if (!(await doesPathExist(link.absolutePath))) {
                        violations.push({
                            severity: "error",
                            message: `Link to non-existent file: ${link.path}`
                        });
                    }
                }

                return violations;
            }
        };
    }
};

export interface MarkdownLink {
    path: string;
    absolutePath: AbsoluteFilePath;
}

export function getReferencedMarkdownFiles({
    content,
    absoluteFilepath
}: {
    content: string;
    absoluteFilepath: AbsoluteFilePath;
}): MarkdownLink[] {
    const matches = content.matchAll(LINK_PATTERN);

    // Extract the second group from each match (the file path)
    const links: MarkdownLink[] = [];
    for (const match of matches) {
        if (match[2] == null) {
            continue;
        } else if (!match[2].endsWith("md") && !match[2].endsWith("mdx")) {
            continue;
        }
        const link = match[2];
        const linkFilepath = link.startsWith("/")
            ? AbsoluteFilePath.of(link)
            : join(dirname(absoluteFilepath), RelativeFilePath.of(link));
        links.push({
            path: link,
            absolutePath: linkFilepath
        });
    }

    return links;
}
