import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { z } from "zod";
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

const REMARK_PLUGINS = [remarkGfm];

type MarkdownParseResult = MarkdownParseSuccess | MarkdownParseFailure;

interface MarkdownParseSuccess {
    type: "success";
}

interface MarkdownParseFailure {
    type: "failure";
    message: string | undefined;
}

export const FrontmatterSchema = z.object({
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    slug: z.optional(z.string()),
    redirects: z.optional(z.array(z.string())),
    editThisPageUrl: z.optional(z.string()),
    image: z.optional(z.string()),
    excerpt: z.optional(z.string())
});

async function parseMarkdown({ markdown }: { markdown: string }): Promise<MarkdownParseResult> {
    try {
        const parsed = await serialize(markdown, {
            scope: {},
            mdxOptions: {
                remarkPlugins: REMARK_PLUGINS,
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
