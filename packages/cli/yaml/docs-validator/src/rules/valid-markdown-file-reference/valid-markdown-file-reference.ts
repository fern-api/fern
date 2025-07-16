import { readFile } from "fs/promises"
import grayMatter from "gray-matter"
import { visit } from "unist-util-visit"

import { getReplacedHref, parseMarkdownToTree, trimAnchor } from "@fern-api/docs-markdown-utils"
import { AbsoluteFilePath, doesPathExistSync } from "@fern-api/fs-utils"

import { Rule, RuleViolation } from "../../Rule"

export const ValidMarkdownFileReferences: Rule = {
    name: "valid-markdown-file-references",
    create: (context) => {
        return {
            filepath: async ({ absoluteFilepath }) => {
                if (!absoluteFilepath.endsWith(".md") && !absoluteFilepath.endsWith(".mdx")) {
                    return []
                }

                try {
                    const fileContents = await readFile(absoluteFilepath, "utf-8")
                    const { content } = grayMatter(fileContents, {})

                    const tree = parseMarkdownToTree(content)

                    const errors: RuleViolation[] = []

                    visit(tree, (node) => {
                        if (node.type === "link") {
                            const href = getReplacedHref({
                                href: trimAnchor(node.url),
                                metadata: {
                                    absolutePathToFernFolder: absoluteFilepath,
                                    absolutePathToMarkdownFile: absoluteFilepath
                                },
                                markdownFilesToPathName: {}
                            })

                            if (href?.type === "missing-reference") {
                                try {
                                    const pathExists = doesPathExistSync(AbsoluteFilePath.of(href.path))
                                    errors.push({
                                        severity: "error",
                                        message: pathExists
                                            ? `File ${href.href} does not exit`
                                            : `File ${href.href} exists but is not specified in docs.yml`
                                    })
                                    // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
                                } catch (err) {}
                            }
                        }
                    })

                    return errors
                } catch (error) {
                    return []
                }
            }
        }
    }
}
