import { readFile } from "fs/promises";

import { AbsoluteFilePath, RelativeFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

async function defaultFileLoader(filepath: AbsoluteFilePath): Promise<string> {
    // strip frontmatter from the referenced markdown
    const file = await readFile(filepath);
    return file.toString();
}

// TODO: add a newline before and after the code block if inline to improve markdown parsing. i.e. <CodeGroup> <Code src="" /> </CodeGroup>
export async function replaceReferencedCode({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMdx,
    context,
    // allow for custom markdown loader for testing
    fileLoader = defaultFileLoader
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMdx: AbsoluteFilePath;
    context: TaskContext;
    fileLoader?: (filepath: AbsoluteFilePath) => Promise<string>;
}): Promise<string> {
    if (!markdown.includes("<Code ")) {
        return markdown;
    }

    // TODO: add support for other props, such as title, language, line height, etc
    const regex = /([ \t]*)<Code\s+src={?['"]([^'"]+)['"](?! \+)}?\s*\/>/g;

    let newMarkdown = markdown;

    // while match is found, replace the match with the content of the referenced markdown file
    let match: RegExpExecArray | null;
    while ((match = regex.exec(markdown)) != null) {
        const matchString = match[0];
        const indent = match[1];
        const src = match[2];

        if (matchString == null || src == null) {
            throw new Error(`Failed to parse regex "${match}" in ${absolutePathToMdx}`);
        }

        const filepath = resolve(
            src.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMdx),
            RelativeFilePath.of(src.replace(/^\//, ""))
        );

        try {
            let replacement = await fileLoader(filepath);
            let metastring = "";
            const language = filepath.split(".").pop();
            if (language != null) {
                metastring += language;
            }
            const title = filepath.split("/").pop();
            if (title != null) {
                metastring += ` title="${title}"`;
            }

            // TODO: if the code content includes ```, add more backticks to avoid conflicts
            replacement = `\`\`\`${metastring}\n${replacement}\n\`\`\``;
            replacement = replacement
                .split("\n")
                .map((line) => indent + line)
                .join("\n");
            replacement = replacement + "\n"; // add newline after the code block
            newMarkdown = newMarkdown.replace(matchString, replacement);
        } catch (e) {
            context.failAndThrow(`Failed to read markdown file "${src}" referenced in ${absolutePathToMdx}`, e);
            break;
        }
    }

    return newMarkdown;
}
