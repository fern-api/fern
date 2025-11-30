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

/**
 * Parses a lines parameter value and extracts the specified lines from content.
 * Supports formats:
 * - Single number: "5" or "[5]" (line 5)
 * - Range: "1-10" or "[1-10]" (lines 1 through 10, inclusive)
 * - Array of numbers: "[1,3,5]" (lines 1, 3, and 5)
 * - Array with ranges: "[1-3,5,7-10]" (lines 1-3, 5, and 7-10)
 * All line numbers are 1-indexed.
 * @param content The full file content
 * @param linesParam The lines parameter value
 * @returns The extracted lines as a string, or the original content if parsing fails
 */
function extractLines(content: string, linesParam: string): string {
    const allLines = content.split("\n");
    const lineIndices = new Set<number>();

    // Strip array brackets if present: [1,3,5] -> 1,3,5
    let normalizedParam = linesParam.trim();
    if (normalizedParam.startsWith("[") && normalizedParam.endsWith("]")) {
        normalizedParam = normalizedParam.slice(1, -1);
    }

    // Split by comma to handle comma-separated values
    const parts = normalizedParam.split(",");

    for (const part of parts) {
        const trimmedPart = part.trim();

        // Check for range format: "start-end"
        const rangeMatch = trimmedPart.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1] ?? "1", 10);
            const end = parseInt(rangeMatch[2] ?? "1", 10);
            // Add all lines in the range (inclusive, 1-indexed)
            for (let i = start; i <= end; i++) {
                lineIndices.add(i - 1); // Convert to 0-indexed
            }
            continue;
        }

        // Check for single number format: "5"
        const singleMatch = trimmedPart.match(/^(\d+)$/);
        if (singleMatch) {
            const lineNum = parseInt(singleMatch[1] ?? "1", 10);
            lineIndices.add(lineNum - 1); // Convert to 0-indexed
            continue;
        }

        // If any part doesn't match, return original content
        if (trimmedPart !== "") {
            return content;
        }
    }

    // If no valid line indices were found, return original content
    if (lineIndices.size === 0) {
        return content;
    }

    // Sort indices and extract lines in order
    const sortedIndices = Array.from(lineIndices).sort((a, b) => a - b);
    const extractedLines = sortedIndices
        .filter((idx) => idx >= 0 && idx < allLines.length)
        .map((idx) => allLines[idx] ?? "");

    return extractedLines.join("\n");
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
    if (!markdown.includes("<Code")) {
        return markdown;
    }

    const regex = /([ \t]*)<Code(?![a-zA-Z])[\s\S]*?src={?['"]([^'"]+)['"](?! \+)}?([\s\S]*?)\/>/g;

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

            // Parse all properties from the Code component
            const allProps = new Map<string, { value: string; fromCurlyBraces: boolean }>();
            const propsRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)")/g;

            // Extract props before src
            const beforeSrcProps = matchString?.split("src=")[0]?.trim() ?? "";
            let propMatch;
            while ((propMatch = propsRegex.exec(beforeSrcProps)) !== null) {
                const propName = propMatch[1];
                const propValue = propMatch[2] || propMatch[3];
                const fromCurlyBraces = propMatch[2] !== undefined;
                if (propName && propValue) {
                    allProps.set(propName, { value: propValue, fromCurlyBraces });
                }
            }

            // Extract props after src
            const afterSrcProps = match[3]?.trim() || "";
            propsRegex.lastIndex = 0; // Reset regex
            while ((propMatch = propsRegex.exec(afterSrcProps)) !== null) {
                const propName = propMatch[1];
                const propValue = propMatch[2] || propMatch[3];
                const fromCurlyBraces = propMatch[2] !== undefined;
                if (propName && propValue) {
                    allProps.set(propName, { value: propValue, fromCurlyBraces });
                }
            }

            allProps.delete("src");

            let languageProp = allProps.get("language");
            if (languageProp) {
                language = languageProp.value;
                allProps.delete("language");
            }

            let titleProp = allProps.get("title");
            if (titleProp) {
                title = titleProp.value;
                allProps.delete("title");
            }

            // Handle lines parameter - extract specific lines from the content
            const linesProp = allProps.get("lines");
            if (linesProp) {
                replacement = extractLines(replacement, linesProp.value);
                allProps.delete("lines");
            }

            // Build metastring
            let metastring = "";
            if (language != null) {
                metastring += language;
            }
            if (title != null) {
                if (titleProp?.fromCurlyBraces) {
                    metastring += ` title={${title}}`;
                } else {
                    metastring += ` title={"${title}"}`;
                }
            }

            // Add remaining properties as-is to metastring
            for (const [propName, propData] of allProps) {
                metastring += ` ${propName}={${propData.value}}`;
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
