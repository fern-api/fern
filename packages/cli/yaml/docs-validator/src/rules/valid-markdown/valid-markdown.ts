import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { z } from "zod";

import { getMarkdownFormat, parseImagePaths, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";

import { Rule } from "../../Rule";

export const ValidMarkdownRule: Rule = {
    name: "valid-markdown",
    create: ({ logger, workspace }) => {
        return {
            markdownPage: async ({ content, absoluteFilepath }) => {
                let format: "mdx" | "md";
                try {
                    format = getMarkdownFormat(absoluteFilepath);
                } catch (err) {
                    return [
                        {
                            severity: "error",
                            message: `Markdown file does not have a valid extension: ${String(err)}`
                        }
                    ];
                }
                const markdownParseResult = await parseMarkdown({
                    markdown: content,
                    absoluteFilepath,
                    absolutePathToFernFolder: dirname(workspace.absoluteFilepathToDocsConfig),
                    logger
                });
                if (markdownParseResult.type === "failure") {
                    const message =
                        markdownParseResult.message != null
                            ? `Markdown failed to parse: ${markdownParseResult.message}`
                            : "Markdown failed to parse";
                    return [
                        {
                            severity: "fatal",
                            message
                        }
                    ];
                }

                return [];
            }
        };
    }
};

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

type MarkdownParseResult = MarkdownParseSuccess | MarkdownParseFailure;

interface MarkdownParseSuccess {
    type: "success";
}

interface MarkdownParseFailure {
    type: "failure";
    message: string | undefined;
}

export const FrontmatterSchema = z.object({
    title: z.optional(z.string(), { description: "Renders as the page title." }),
    "og:title": z.optional(z.string(), { description: "Renders as the og:title tag." }),
    "og:description": z.optional(z.string(), { description: "Renders as the og:description tag." }),
    subtitle: z.optional(z.string(), {
        description:
            "Renders as a subtitle on the page, and is also used in the meta description tag if description is not set."
    }),
    description: z.optional(z.string(), { description: "Renders as the meta description tag." }),
    image: z.optional(z.string(), { description: "Renders as the og:image tag." }),
    slug: z.optional(z.string(), {
        description: "The full slug path for the page, starting from root `/` (or basepath)."
    }),
    redirects: z.optional(z.array(z.string()), { description: "A list of URLs to redirect to this page." }),
    editThisPageUrl: z.optional(z.string()),
    excerpt: z.optional(z.string(), { description: "Deprecated. Use `subtitle` instead." })
});

async function parseMarkdown({
    markdown,
    absoluteFilepath,
    absolutePathToFernFolder,
    logger
}: {
    markdown: string;
    absoluteFilepath: AbsoluteFilePath;
    absolutePathToFernFolder: AbsoluteFilePath;
    logger: Logger;
}): Promise<MarkdownParseResult> {
    try {
        logger.trace(`Starting markdown parse for file: ${absoluteFilepath}`);

        parseImagePaths(markdown, {
            absolutePathToMarkdownFile: absoluteFilepath,
            absolutePathToFernFolder
        });

        logger.trace("Serializing markdown with MDX");
        const parsed = await serialize(markdown, {
            scope: {},
            mdxOptions: {
                remarkPlugins: REMARK_PLUGINS,
                rehypePlugins: REHYPE_PLUGINS,
                format: "detect"
            },
            parseFrontmatter: true
        });

        logger.trace("Validating frontmatter");
        const frontmatterParseResult = FrontmatterSchema.safeParse(parsed.frontmatter);
        if (!frontmatterParseResult.success) {
            logger.trace(
                `Frontmatter validation failed: ${frontmatterParseResult.error.errors.map((e) => e.message).join(", ")}`
            );
            return {
                type: "failure",
                message: `Failed to parse frontmatter: ${frontmatterParseResult.error.errors
                    .map((error) => error.message)
                    .join("\n")}`
            };
        }

        logger.trace("Markdown parse completed successfully");
        return {
            type: "success"
        };
    } catch (err) {
        logger.trace(`Markdown parse failed with error: ${err instanceof Error ? err.message : String(err)}`);
        return {
            type: "failure",
            message: err instanceof Error ? err.message : undefined
        };
    }
}
