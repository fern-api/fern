import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
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

async function parseMarkdown({ markdown }: { markdown: string }): Promise<MarkdownParseResult> {
    try {
        await serialize(markdown, {
            scope: {},
            mdxOptions: {
                remarkPlugins: REMARK_PLUGINS,
                format: "detect"
            },
            parseFrontmatter: false
        });
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
