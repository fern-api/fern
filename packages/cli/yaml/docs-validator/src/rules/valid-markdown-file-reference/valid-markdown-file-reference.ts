import { readFile } from "fs/promises";
import grayMatter from "gray-matter";
import { relative } from "path";
import { visit } from "unist-util-visit";

import { getMarkdownFormat, getReplacedHref, parseMarkdownToTree, trimAnchor } from "@fern-api/docs-markdown-utils";

import { Rule, RuleViolation } from "../../Rule";

export const ValidMarkdownFileReferences: Rule = {
    name: "valid-markdown-file-references",
    create: (context) => {
        return {
            filepath: async ({ absoluteFilepath }) => {
                if (!absoluteFilepath.endsWith(".md") && !absoluteFilepath.endsWith(".mdx")) {
                    return [];
                }

                try {
                    const fileContents = await readFile(absoluteFilepath, "utf-8");
                    const { content } = grayMatter(fileContents, {});

                    const tree = parseMarkdownToTree(content, getMarkdownFormat(absoluteFilepath));

                    const errors: RuleViolation[] = [];

                    visit(tree, (node) => {
                        if (node.type === "link") {
                            const href = getReplacedHref({
                                href: trimAnchor(node.url),
                                metadata: {
                                    absolutePathToFernFolder: absoluteFilepath,
                                    absolutePathToMarkdownFile: absoluteFilepath
                                },
                                markdownFilesToPathName: {}
                            });

                            if (href?.type === "missing-reference") {
                                errors.push({
                                    severity: "error",
                                    message: `References ${relative(context.workspace.absoluteFilePath, href.path)} which does not exist or is not specified in docs.yml`
                                });
                            }
                        }
                    });

                    return errors;
                } catch (error) {
                    return [];
                }
            }
        };
    }
};
