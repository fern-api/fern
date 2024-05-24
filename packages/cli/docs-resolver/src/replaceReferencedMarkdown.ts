import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

export async function replaceReferencedMarkdown({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMdx,
    context
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMdx: AbsoluteFilePath;
    context: TaskContext;
}): Promise<string> {
    if (!markdown.includes("<Markdown")) {
        return markdown;
    }

    const regex = /<Markdown\s+src={?['"]([^'"]+)['"](?! \+)}?\s*\/>/g;

    // while match is found, replace the match with the content of the referenced markdown file
    let match: RegExpExecArray | null;
    while ((match = regex.exec(markdown)) != null) {
        const matchString = match[0];
        const src = match[1];

        if (matchString == null || src == null) {
            throw new Error(`Failed to parse regex "${match}" in ${absolutePathToMdx}`);
        }

        if (!src.endsWith(".md") && !src.endsWith(".mdx")) {
            context.failAndThrow(
                `Referenced markdown file "${src}" must have a .md or .mdx extension in ${absolutePathToMdx}`
            );
            break;
        }

        const filepath = resolve(
            src.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMdx),
            RelativeFilePath.of(src.replace(/^\//, ""))
        );

        try {
            // strip frontmatter from the referenced markdown
            const { content } = grayMatter(await readFile(filepath));

            markdown = markdown.replace(matchString, content);
        } catch (e) {
            context.failAndThrow(`Failed to read markdown file "${src}" referenced in ${absolutePathToMdx}`, e);
            break;
        }
    }

    return markdown;
}
