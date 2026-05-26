import { getAllPages, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";

import { readFile } from "fs/promises";
import path from "path";

import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
import type { MdxErrorCode } from "../errors/MdxErrorCode.js";
import { classifyMdxError } from "../errors/MdxErrorCode.js";
import { MdxParseError, type SourceLine } from "../errors/MdxParseError.js";

/**
 * Number of context lines (including the error line) to display in error
 * snippets. Matches Rust's default `--diagnostics-format=human` window.
 */
const SOURCE_CONTEXT_LINES_BEFORE = 2;
const SOURCE_CONTEXT_LINES_AFTER = 0;

/**
 * Validates each MDX/Markdown page by parsing it into an mdast tree.
 *
 * Any parse failures are surfaced as {@link MdxParseError} instances with
 * code, file, line, column, and a small source snippet — the cli-v2
 * equivalent of cli (v1)'s `validateMdxFiles`, but extended with stable
 * error codes and fix suggestions.
 */
export declare namespace MdxParseValidator {
    export interface Config {
        context: Context;
        task?: Task;
    }

    export interface Result {
        errors: MdxParseError[];
        totalFiles: number;
        elapsedMillis: number;
    }
}

export class MdxParseValidator {
    private readonly context: Context;
    private readonly taskContext: TaskContextAdapter;

    constructor(config: MdxParseValidator.Config) {
        this.context = config.context;
        this.taskContext = new TaskContextAdapter({ context: this.context, task: config.task });
    }

    /**
     * Run MDX parse validation across every page reachable from the navigation.
     */
    public async validate({ workspace }: { workspace: DocsWorkspace }): Promise<MdxParseValidator.Result> {
        const startTime = performance.now();

        const parsedConfig = await parseDocsConfiguration({
            rawDocsConfiguration: workspace.config,
            absolutePathToFernFolder: workspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: workspace.absoluteFilepathToDocsConfig,
            context: this.taskContext
        });

        const allPages = getAllPages({
            landingPage: parsedConfig.landingPage,
            navigation: parsedConfig.navigation
        });

        // A page can appear multiple times in the navigation tree; we still
        // only want to validate it once.
        const filesToCheck = Array.from(new Set(allPages));

        // Lazy-load the parser so we don't pay the cost when there are no docs.
        const { parseMarkdownToTree } = await import("@fern-api/docs-markdown-utils");

        const errorOrNulls = await Promise.all(
            filesToCheck.map(async (filepath) => {
                const content = await readFile(filepath, "utf-8");
                try {
                    parseMarkdownToTree(content);
                    return null;
                } catch (error) {
                    return this.buildMdxParseError({ filepath, content, error });
                }
            })
        );
        const errors = errorOrNulls.filter((e): e is MdxParseError => e != null);

        return {
            errors,
            totalFiles: filesToCheck.length,
            elapsedMillis: performance.now() - startTime
        };
    }

    private buildMdxParseError({
        filepath,
        content,
        error
    }: {
        filepath: AbsoluteFilePath;
        content: string;
        error: unknown;
    }): MdxParseError {
        const rawMessage = error instanceof Error ? error.message : String(error);
        const code: MdxErrorCode = classifyMdxError(rawMessage);

        // The parser strips frontmatter before reporting line numbers, so we
        // need to add the frontmatter offset back to map errors to user-visible
        // line numbers in the source file.
        //
        // We derive the offset by scanning the original content for the closing
        // "---" delimiter rather than subtracting line counts, because gray-matter
        // may strip leading blank lines from the returned body which would make
        // a line-count subtraction incorrect.
        const frontmatterLineCount = countFrontmatterLines(content);

        const { line, column } = extractLineColumn(error, frontmatterLineCount);

        const sourceLines = line != null ? buildSourceLines({ content, errorLine: line }) : [];
        const errorLineContent = sourceLines.find((l) => l.isErrorLine)?.content ?? "";
        const fix = code.suggestFix?.({ errorLineContent, rawMessage });

        const displayRelativeFilepath = path.relative(this.context.cwd, filepath);

        return new MdxParseError({
            code,
            displayRelativeFilepath,
            line,
            column,
            rawMessage,
            sourceLines,
            fix
        });
    }
}

interface ExtractedLineColumn {
    line: number | undefined;
    column: number | undefined;
}

interface ParserErrorShape {
    line?: number;
    column?: number;
    place?: { line?: number; column?: number };
    position?: { start?: { line?: number; column?: number } };
}

function isParserErrorShape(error: unknown): error is ParserErrorShape {
    return error != null && typeof error === "object";
}

/**
 * Best-effort extraction of `(line, column)` from heterogeneous mdast/micromark
 * error shapes. Returns 1-based file-local line numbers (i.e. accounting for
 * the YAML frontmatter that the parser strips before counting lines).
 */
function extractLineColumn(error: unknown, frontmatterLineCount: number): ExtractedLineColumn {
    if (!isParserErrorShape(error)) {
        return { line: undefined, column: undefined };
    }

    if (error.line != null) {
        return { line: error.line + frontmatterLineCount, column: error.column };
    }
    if (error.place?.line != null) {
        return { line: error.place.line + frontmatterLineCount, column: error.place.column };
    }
    if (error.position?.start?.line != null) {
        return {
            line: error.position.start.line + frontmatterLineCount,
            column: error.position.start.column
        };
    }
    return { line: undefined, column: undefined };
}

/**
 * Count the number of lines occupied by YAML frontmatter (including both
 * delimiter lines). Returns 0 when no frontmatter is present.
 *
 * We scan the raw content directly rather than relying on the line-count
 * difference between the original string and the gray-matter output, because
 * gray-matter may strip leading blank lines from the returned body, causing
 * that subtraction to be off by one or more.
 */
function countFrontmatterLines(content: string): number {
    if (!content.startsWith("---")) {
        return 0;
    }
    const lines = content.split("\n");
    // lines[0] is the opening "---"; scan from line index 1 for the closing "---"
    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i]?.trimEnd();
        if (trimmed === "---") {
            // Frontmatter occupies lines 0..i (inclusive), which is i+1 lines.
            return i + 1;
        }
    }
    // Opening delimiter found but no closing delimiter — treat as no frontmatter.
    return 0;
}

/**
 * Build a small window of source lines for display, including the error line.
 */
function buildSourceLines({ content, errorLine }: { content: string; errorLine: number }): SourceLine[] {
    const allLines = content.split("\n");
    const start = Math.max(1, errorLine - SOURCE_CONTEXT_LINES_BEFORE);
    const end = Math.min(allLines.length, errorLine + SOURCE_CONTEXT_LINES_AFTER);

    const result: SourceLine[] = [];
    for (let lineNumber = start; lineNumber <= end; lineNumber++) {
        result.push({
            lineNumber,
            content: allLines[lineNumber - 1] ?? "",
            isErrorLine: lineNumber === errorLine
        });
    }
    return result;
}
