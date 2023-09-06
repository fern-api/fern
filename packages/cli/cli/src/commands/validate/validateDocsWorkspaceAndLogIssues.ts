import { LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";

export async function validateDocsWorkspaceAndLogIssues(workspace: DocsWorkspace, context: TaskContext): Promise<void> {
    for (const [relativeFilepath, markdown] of Object.entries(workspace.docsDefinition.pages)) {
        const markdownParseResult = await parseMarkdown({ markdown });
        if (markdownParseResult.type === "failure") {
            const message =
                markdownParseResult.message != null
                    ? `${relativeFilepath} contains invalid markdown: ${markdownParseResult.message}`
                    : `${relativeFilepath} contains invalid markdown`;
            context.logger.log(LogLevel.Error, message);
        }
    }
}

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
                format: "detect",
            },
            parseFrontmatter: false,
        });
        return {
            type: "success",
        };
    } catch (err) {
        return {
            type: "failure",
            message: err instanceof Error ? err.message : undefined,
        };
    }
}
