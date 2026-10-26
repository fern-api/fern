import { AbsoluteFilePath, dirname, RelativeFilePath, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

export interface ReferencedMarkdownFile {
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
    content: string;
}

export interface ReplaceReferencedMarkdownResult {
    markdown: string;
    referencedFiles: ReferencedMarkdownFile[];
}

async function defaultMarkdownLoader(filepath: AbsoluteFilePath) {
    // strip frontmatter from the referenced markdown
    const { content } = grayMatter(await readFile(filepath));
    return content;
}

/** Returns the index just past the closing quote of the JSX attribute string starting at `start`, or -1. */
function skipAttributeString(source: string, start: number): number {
    const end = source.indexOf(source.charAt(start), start + 1);
    return end === -1 ? -1 : end + 1;
}

/** Returns the index just past the closing quote of the JS string literal starting at `start`, or -1. */
function skipJsString(source: string, start: number): number {
    const quote = source.charAt(start);
    for (let i = start + 1; i < source.length; i++) {
        const ch = source.charAt(i);
        if (ch === "\\") {
            i++;
        } else if (ch === quote) {
            return i + 1;
        }
    }
    return -1;
}

/** Returns the index just past the `}` that balances the `{` at `start`, or -1. */
function skipBracedExpression(source: string, start: number): number {
    let depth = 0;
    for (let i = start; i < source.length; i++) {
        const ch = source.charAt(i);
        if (ch === '"' || ch === "'" || ch === "`") {
            const end = skipJsString(source, i);
            if (end === -1) {
                return -1;
            }
            i = end - 1;
        } else if (ch === "{") {
            depth++;
        } else if (ch === "}") {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
    }
    return -1;
}

/**
 * Scans the attributes of a `<Markdown` tag starting at `start` and returns the index just past its `/>`,
 * or -1 if the tag isn't self-closing. Quoted and `{...}` values are skipped whole, so a `>` inside a value
 * (e.g. `returnType="Promise<void>"`) doesn't end the tag.
 */
function findSelfClosingTagEnd(source: string, start: number): number {
    let i = start;
    while (i < source.length) {
        const ch = source.charAt(i);
        if (ch === '"' || ch === "'") {
            i = skipAttributeString(source, i);
        } else if (ch === "{") {
            i = skipBracedExpression(source, i);
        } else if (ch === ">") {
            return -1;
        } else if (ch === "/" && source.charAt(i + 1) === ">") {
            return i + 2;
        } else {
            i++;
        }
        if (i === -1) {
            return -1;
        }
    }
    return -1;
}

interface MarkdownTagMatch {
    index: number;
    matchString: string;
    indent: string;
    attributesString: string;
}

function findMarkdownTags(markdown: string): MarkdownTagMatch[] {
    const tags: MarkdownTagMatch[] = [];
    const tagStartRegex = /([ \t]*)<Markdown\s+/g;

    let startMatch: RegExpExecArray | null;
    while ((startMatch = tagStartRegex.exec(markdown)) != null) {
        const attributesStart = tagStartRegex.lastIndex;
        const end = findSelfClosingTagEnd(markdown, attributesStart);
        if (end === -1) {
            continue;
        }
        tags.push({
            index: startMatch.index,
            matchString: markdown.slice(startMatch.index, end),
            indent: startMatch[1] ?? "",
            attributesString: markdown.slice(attributesStart, end - 2)
        });
        tagStartRegex.lastIndex = end;
    }

    return tags;
}

/** `{"value"}` / `{'value'}` / `` {`value`} `` evaluate to the string literal; any other expression is kept as written. */
function unwrapExpression(expression: string): string {
    const trimmed = expression.trim();
    const quote = trimmed.charAt(0);
    if ((quote === '"' || quote === "'" || quote === "`") && skipJsString(trimmed, 0) === trimmed.length) {
        const literal = trimmed.slice(1, -1);
        if (quote !== "`" || !literal.includes("${")) {
            return literal.replace(/\\(["'`\\])/g, "$1");
        }
    }
    return expression;
}

function extractAttributes(attributesString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrNameRegex = /(\w+)=/g;

    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrNameRegex.exec(attributesString)) != null) {
        const attrName = attrMatch[1];
        const valueStart = attrNameRegex.lastIndex;
        const ch = attributesString.charAt(valueStart);

        let attrValue: string | undefined;
        let valueEnd = -1;
        if (ch === '"' || ch === "'") {
            valueEnd = skipAttributeString(attributesString, valueStart);
            if (valueEnd !== -1) {
                attrValue = attributesString.slice(valueStart + 1, valueEnd - 1);
            }
        } else if (ch === "{") {
            valueEnd = skipBracedExpression(attributesString, valueStart);
            if (valueEnd !== -1) {
                attrValue = unwrapExpression(attributesString.slice(valueStart + 1, valueEnd - 1));
            }
        }

        if (valueEnd !== -1) {
            attrNameRegex.lastIndex = valueEnd;
        }
        if (attrName != null && attrValue != null && attrValue.length > 0) {
            attributes[attrName] = attrValue;
        }
    }

    return attributes;
}

function extractVariablesFromContent(content: string): Set<string> {
    const vars = new Set<string>();
    const VAR_REGEX = /{{([A-Za-z_][A-Za-z0-9_]*)}}/g;

    let match: RegExpExecArray | null;
    while ((match = VAR_REGEX.exec(content)) != null) {
        if (match[1] != null) {
            vars.add(match[1]);
        }
    }

    return vars;
}

// Any number of blockquote markers followed by an optional list marker, e.g. `10. `, `- `, `> 1. `, `> > - `.
const CONTAINER_PREFIX_REGEX = /^(?:[ \t]*>)*[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)?$/;

/**
 * When the tag is the first thing inside a list item and/or blockquote (e.g. `10. <Markdown .../>`),
 * continuation lines must keep the blockquote markers and be indented to the item's content column
 * so they stay inside the container. Otherwise fall back to the tag's leading whitespace.
 */
function getContinuationIndent(source: string, tagIndex: number, leadingWhitespace: string): string {
    const lineStart = source.lastIndexOf("\n", tagIndex - 1) + 1;
    const linePrefix = source.slice(lineStart, tagIndex);
    if (CONTAINER_PREFIX_REGEX.test(linePrefix)) {
        return linePrefix.replace(/[^\t>]/g, " ");
    }
    return leadingWhitespace;
}

function getLineNumber(source: string, index: number): number {
    return source.slice(0, index).split("\n").length;
}

function substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
        const variablePattern = new RegExp(`\\{{${key}\\}}`, "g");
        result = result.replace(variablePattern, value);
    }

    return result;
}

export async function replaceReferencedMarkdown({
    markdown,
    absolutePathToFernFolder,
    absolutePathToMarkdownFile,
    context,
    // allow for custom markdown loader for testing
    markdownLoader = defaultMarkdownLoader,
    // track ancestor files to detect circular references
    ancestorFiles = new Set<string>(),
    // collect referenced files for tracking
    collectedFiles = new Map<AbsoluteFilePath, ReferencedMarkdownFile>()
}: {
    markdown: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
    context: TaskContext;
    markdownLoader?: (filepath: AbsoluteFilePath) => Promise<string>;
    ancestorFiles?: Set<string>;
    collectedFiles?: Map<AbsoluteFilePath, ReferencedMarkdownFile>;
}): Promise<ReplaceReferencedMarkdownResult> {
    if (!markdown.includes("<Markdown")) {
        return { markdown, referencedFiles: Array.from(collectedFiles.values()) };
    }

    let newMarkdown = markdown;

    // replace each tag with the content of the referenced markdown file
    for (const { index, matchString, indent, attributesString } of findMarkdownTags(markdown)) {
        const attributes = extractAttributes(attributesString);
        const src = attributes.src;

        if (src == null || !src.match(/\.mdx?$/)) {
            continue;
        }

        const filepath = resolve(
            src.startsWith("/") ? absolutePathToFernFolder : dirname(absolutePathToMarkdownFile),
            RelativeFilePath.of(src.replace(/^\//, ""))
        );

        // Check for circular reference
        if (ancestorFiles.has(filepath)) {
            const line = getLineNumber(markdown, index);
            context.logger.warn(
                `[${absolutePathToMarkdownFile}:${line}] Circular reference detected: "${src}" is already being processed in the current chain`
            );
            continue;
        }

        try {
            // Check cache first to avoid redundant file reads and gray-matter parsing
            const cached = collectedFiles.get(filepath);
            let rawContent: string;
            if (cached != null) {
                rawContent = cached.content;
            } else {
                rawContent = await markdownLoader(filepath);
                // Store the referenced file with its raw content (before variable substitution)
                collectedFiles.set(filepath, {
                    absoluteFilePath: filepath,
                    relativeFilePath: relative(absolutePathToFernFolder, filepath),
                    content: rawContent
                });
            }

            let replaceString = rawContent;

            const { src: _, ...variables } = attributes;

            const usedVariables = extractVariablesFromContent(replaceString);
            const providedVariables = new Set(Object.keys(variables));
            const missingVariables = [...usedVariables].filter((v) => !providedVariables.has(v));

            if (missingVariables.length > 0) {
                const line = getLineNumber(markdown, index);

                for (const variable of missingVariables) {
                    context.logger.warn(
                        `[${absolutePathToMarkdownFile}:${line}] Markdown snippet missing property: \`${variable}\``
                    );
                }
            }

            replaceString = substituteVariables(replaceString, variables);

            // Recursively replace referenced markdown in the loaded content
            const newAncestorFiles = new Set(ancestorFiles);
            newAncestorFiles.add(filepath);
            const result = await replaceReferencedMarkdown({
                markdown: replaceString,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile: filepath,
                context,
                markdownLoader,
                ancestorFiles: newAncestorFiles,
                collectedFiles
            });
            replaceString = result.markdown;

            const tagIndex = index + indent.length;
            const continuationIndent = getContinuationIndent(markdown, tagIndex, indent);
            replaceString = replaceString
                .split("\n")
                .map((line, i) => (i === 0 ? indent : continuationIndent) + line)
                .join("\n");
            newMarkdown = newMarkdown.replace(matchString, replaceString);
        } catch (e) {
            context.logger.warn(`Failed to read markdown file "${src}" referenced in ${absolutePathToMarkdownFile}`);
            break;
        }
    }

    return { markdown: newMarkdown, referencedFiles: Array.from(collectedFiles.values()) };
}
