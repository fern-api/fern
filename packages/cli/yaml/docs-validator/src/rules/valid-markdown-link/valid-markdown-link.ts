import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Rule, RuleViolation } from "../../Rule";

const LINK_PATTERN = /\[([^\]]+)\]\((.*?)\)/g;

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: () => {
        return {
            markdownPage: async ({ content, absoluteFilepath }) => {
                // Find all matches in the Markdown text
                const violations: RuleViolation[] = [];

                const matches = content.matchAll(LINK_PATTERN);

                // Extract the second group from each match (the file path)
                const links: string[] = [];
                for (const match of matches) {
                    if (match[2] != null) {
                        links.push(match[2]);
                    }
                }

                for (const link of links) {
                    if (link.endsWith("md") || link.endsWith("mdx")) {
                        const linkFilepath = link.startsWith("/")
                            ? AbsoluteFilePath.of(link)
                            : join(dirname(absoluteFilepath), RelativeFilePath.of(link));
                        if (!(await doesPathExist(linkFilepath))) {
                            violations.push({
                                severity: "error",
                                message: `Link to non-existent file: ${link}`
                            });
                        }
                    }
                }

                return violations;
            }
        };
    }
};
