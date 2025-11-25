import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { isAbsolute } from "path";

async function defaultFileLoader(filepath: AbsoluteFilePath): Promise<string> {
    // strip frontmatter from the referenced markdown
    const file = await readFile(filepath);
    return file.toString();
}

// TODO: add a newline before and after the code block if inline to improve markdown parsing. i.e. <CodeGroup> <Code src="" /> </CodeGroup>
export async function replaceReferencedCode({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMarkdownFile,
    context,
    // allow for custom markdown loader for testing
    fileLoader = defaultFileLoader
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
    context: TaskContext;
    fileLoader?: (filepath: AbsoluteFilePath) => Promise<string>;
}): Promise<string> {
    if (!markdown.includes("<Code ")) {
        return markdown;
    }

    const regex = /([ \t]*)<Code(?:\s+[^>]*?)?\s+src={?['"]([^'"]+)['"](?! \+)}?((?:\s+[^>]*)?)\/>/g;

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
            let replacement = await fileLoader(filepath);
            let metastring = "";
            const language = filepath.split(".").pop();
            if (language != null) {
                metastring += language;
            }
            const title = filepath.split("/").pop();
            if (title != null) {
                metastring += ` title={"${title}"}`;
            }

            // Extract
            const additionalProps = match[3]?.trim() || "";
            if (additionalProps) {
                // Parse and add any additional props to the metastring
                const propsRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)")/g;
                let propMatch;
                while ((propMatch = propsRegex.exec(additionalProps)) !== null) {
                    const propName = propMatch[1];
                    const propValue = propMatch[2] || propMatch[3];
                    if (propName && propValue && propName !== "src") {
                        metastring += ` ${propName}=${propValue.includes("{") ? propValue : `{${propValue}}`}`;
                    }
                }
            }

            // Extract props before src
            const beforeSrcProps = matchString?.split("src=")[0]?.trim() ?? "";
            if (beforeSrcProps) {
                const beforePropsRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)")/g;
                let beforePropMatch;
                while ((beforePropMatch = beforePropsRegex.exec(beforeSrcProps)) !== null) {
                    const propName = beforePropMatch[1];
                    const propValue = beforePropMatch[2] || beforePropMatch[3];
                    if (propName && propValue && propName !== "src") {
                        metastring += ` ${propName}=${propValue.includes("{") ? propValue : `{${propValue}}`}`;
                    }
                }
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
            context.logger.warn(`Failed to read markdown file "${src}" referenced in ${absolutePathToMarkdownFile}`);
            break;
        }
    }

    return newMarkdown;
}
