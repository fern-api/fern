import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { z } from "zod";

import { parseMarkdownToTree } from "@fern-api/docs-markdown-utils";

import { Rule } from "../../Rule";

export const ValidMarkdownRule: Rule = {
    name: "valid-markdown",
    create: () => {
        return {
            markdownPage: async ({ content }) => {
                const markdownParseResult = await parseMarkdown({ markdown: content });
                if (markdownParseResult.type === "failure") {
                    const message =
                        markdownParseResult.message != null
                            ? `Markdown failed to parse: ${markdownParseResult.message}`
                            : "Markdown failed to parse";
                    return [
                        {
                            severity: "error",
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

async function parseMarkdown({ markdown }: { markdown: string }): Promise<MarkdownParseResult> {
    try {
        parseMarkdownToTree(markdown);

        const parsed = await serialize(markdown, {
            scope: {},
            mdxOptions: {
                remarkPlugins: REMARK_PLUGINS,
                rehypePlugins: REHYPE_PLUGINS,
                format: "detect"
            },
            parseFrontmatter: true
        });
        const frontmatterParseResult = FrontmatterSchema.safeParse(parsed.frontmatter);
        if (!frontmatterParseResult.success) {
            return {
                type: "failure",
                message: `Failed to parse frontmatter: ${frontmatterParseResult.error.errors
                    .map((error) => error.message)
                    .join("\n")}`
            };
        }
        return {
            type: "success"
        };
    } catch (err) {
        return {
            type: "failure",
            message: err instanceof Error ? err.message : undefined
        };
    }
}
