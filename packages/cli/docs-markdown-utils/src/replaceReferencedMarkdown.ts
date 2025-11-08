import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

async function defaultMarkdownLoader(filepath: AbsoluteFilePath) {
    // strip frontmatter from the referenced markdown
    const { content } = grayMatter(await readFile(filepath));
    return content;
}

function extractAttributes(markdownTag: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    const attrRegex = /(\w+)=(?:{?['"]([^'"]+)['"]?}?|{([^}]+)})/g;

    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(markdownTag)) != null) {
        const attrName = attrMatch[1];
        const attrValue = attrMatch[2] ?? attrMatch[3];
        if (attrName != null && attrValue != null) {
            attributes[attrName] = attrValue;
        }
    }

    return attributes;
}

function substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
        const variablePattern = new RegExp(`\\{${key}\\}`, "g");
        result = result.replace(variablePattern, value);
    }

    return result;
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

    const regex = /([ \t]*)<Markdown\s+([^>]+)\/>/g;

    let newMarkdown = markdown;

    // while match is found, replace the match with the content of the referenced markdown file
    let match: RegExpExecArray | null;
    while ((match = regex.exec(markdown)) != null) {
        const matchString = match[0];
        const indent = match[1];
        const attributesString = match[2];

        if (matchString == null || attributesString == null) {
            throw new Error(`Failed to parse regex "${match}" in ${absolutePathToMarkdownFile}`);
        }

        const attributes = extractAttributes(attributesString);
        const src = attributes.src;

        if (src == null || !src.match(/\.mdx?$/)) {
            continue;
        }

        const filepath = resolve(
            src.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile),
            RelativeFilePath.of(src.replace(/^\//, ""))
        );

        try {
            let replaceString = await markdownLoader(filepath);

            const { src: _, ...variables } = attributes;

            replaceString = substituteVariables(replaceString, variables);

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
