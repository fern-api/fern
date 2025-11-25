import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";
import { isAbsolute } from "path";

async function defaultMarkdownLoader(filepath: AbsoluteFilePath) {
    // strip frontmatter from the referenced markdown
    const { content } = grayMatter(await readFile(filepath));
    return content;
}

// TODO: recursively replace referenced markdown files
export async function replaceReferencedMarkdown({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMarkdownFile,
    context,
    // allow for custom markdown loader for testing
    markdownLoader = defaultMarkdownLoader
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
    context: TaskContext;
    markdownLoader?: (filepath: AbsoluteFilePath) => Promise<string>;
}): Promise<string> {
    if (!markdown.includes("<Markdown")) {
        return markdown;
    }

    const regex = /([ \t]*)<Markdown\s+src={?['"]([^'"]+.mdx?)['"](?! \+)}?\s*\/>/g;

    let newMarkdown = markdown;

    // while match is found, replace the match with the content of the referenced markdown file
    let match: RegExpExecArray | null;
    while ((match = regex.exec(markdown)) != null) {
        const matchString = match[0];
        const indent = match[1];
        const src = match[2];

        if (matchString == null || src == null) {
            throw new Error(`Failed to parse regex "${match}" in ${absolutePathToMarkdownFile}`);
        }

        // For absolute paths (Unix: /path or Windows: C:\path), resolve from Fern folder
        // For relative paths, resolve from the markdown file's directory
        const isAbsolutePath = isAbsolute(src);
        const basePath = isAbsolutePath ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile);
        const relativePath = isAbsolutePath ? src.replace(/^[/\\]/, "").replace(/^[a-zA-Z]:[\\/]/, "") : src;

        const filepath = resolve(
            basePath,
            RelativeFilePath.of(relativePath)
        );

        try {
            let replaceString = await markdownLoader(filepath);
            replaceString = replaceString
                .split("\n")
                .map((line) => indent + line)
                .join("\n");
            newMarkdown = newMarkdown.replace(matchString, replaceString);
        } catch (e) {
            context.logger.warn(`Failed to read markdown file "${src}" referenced in ${absolutePathToMarkdownFile}`);
            break;
        }
    }

    return newMarkdown;
}
