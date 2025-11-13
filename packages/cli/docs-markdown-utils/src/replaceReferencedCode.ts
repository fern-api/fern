import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

async function defaultFileLoader(filepath: AbsoluteFilePath): Promise<string> {
    // strip frontmatter from the referenced markdown
    const file = await readFile(filepath);
    return file.toString();
}

function isUrl(src: string): boolean {
    return src.startsWith("http://") || src.startsWith("https://");
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

        try {
            let replacement: string;
            let metastring = "";
            let language: string | undefined;
            let title: string | undefined;

            if (isUrl(src)) {
                try {
                    const response = await fetch(src);
                    if (!response.ok) {
                        context.logger.warn(
                            `Failed to fetch code from URL "${src}" (status ${response.status}) referenced in ${absolutePathToMarkdownFile}`
                        );
                        break;
                    }
                    replacement = await response.text();

                    // Extract language and title from URL pathname
                    const url = new URL(src);
                    const pathname = url.pathname;
                    language = pathname.split(".").pop();
                    title = pathname.split("/").pop();
                } catch (e) {
                    context.logger.warn(
                        `Failed to fetch code from URL "${src}" referenced in ${absolutePathToMarkdownFile}: ${e}`
                    );
                    break;
                }
            } else {
                const filepath = resolve(
                    src.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile),
                    RelativeFilePath.of(src.replace(/^\//, ""))
                );
                replacement = await fileLoader(filepath);
                language = filepath.split(".").pop();
                title = filepath.split("/").pop();
            }

            if (language != null) {
                metastring += language;
            }
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
