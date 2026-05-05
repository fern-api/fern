import chalk from "chalk";

import type { MdxErrorCode, MdxFix } from "./MdxErrorCode.js";

export interface SourceLine {
    /** 1-based line number in the original file (including frontmatter). */
    lineNumber: number;
    /** Raw line content (no trailing newline). */
    content: string;
    /** True for the line that contains the error. */
    isErrorLine: boolean;
}

export declare namespace MdxParseError {
    export interface Args {
        code: MdxErrorCode;
        /** File path relative to user's cwd, for display. */
        displayRelativeFilepath: string;
        /** 1-based line number of the error, if known. */
        line: number | undefined;
        /** 1-based column of the error, if known. */
        column: number | undefined;
        /** Raw upstream parser message (kept for debugging / fix prompts). */
        rawMessage: string;
        /** A small window of lines around the error, for display. */
        sourceLines: SourceLine[];
        /** Optional textual fix suggestion. */
        fix: MdxFix | undefined;
    }
}

/**
 * A typed MDX/Markdown parse error with a Rust-style display.
 *
 * Keeps the structured fields around so downstream consumers (JSON output,
 * AI fix prompts, telemetry) don't have to scrape the formatted string.
 */
export class MdxParseError {
    public readonly code: MdxErrorCode;
    public readonly displayRelativeFilepath: string;
    public readonly line: number | undefined;
    public readonly column: number | undefined;
    public readonly rawMessage: string;
    public readonly sourceLines: SourceLine[];
    public readonly fix: MdxFix | undefined;

    constructor(args: MdxParseError.Args) {
        this.code = args.code;
        this.displayRelativeFilepath = args.displayRelativeFilepath;
        this.line = args.line;
        this.column = args.column;
        this.rawMessage = args.rawMessage;
        this.sourceLines = args.sourceLines;
        this.fix = args.fix;
    }

    /**
     * Render the error in a Rust-style multi-line block:
     *
     * ```
     * error[E0301]: JSX element is not valid as an attribute value
     *  --> docs/pages/welcome.mdx:14:32
     *    |
     * 12 | <MyComponent
     * 13 |   label="hello"
     * 14 |   icon=<Icon name="star" />
     *    |        ^ JSX element is not valid as an attribute value
     *    |
     *
     * fix: icon=<Icon name="star" /> → icon={<Icon name="star" />}
     * see: https://buildwithfern.com/learn/docs/errors/E0301
     * ```
     */
    public toString(): string {
        const lines: string[] = [];

        lines.push(this.formatHeader());
        lines.push(this.formatLocationLine());

        const gutterWidth = this.computeGutterWidth();
        const emptyGutter = `${" ".repeat(gutterWidth)} ${chalk.cyan("|")}`;
        lines.push(emptyGutter);

        for (const sourceLine of this.sourceLines) {
            lines.push(this.formatSourceLine(sourceLine, gutterWidth));
            if (sourceLine.isErrorLine) {
                const caret = this.formatCaretLine(sourceLine, gutterWidth);
                if (caret != null) {
                    lines.push(caret);
                }
            }
        }
        lines.push(emptyGutter);

        if (this.code.description != null) {
            lines.push(`${chalk.dim("note:")} ${this.code.description}`);
        }

        if (this.fix != null) {
            lines.push("");
            lines.push(this.formatFixLine(this.fix));
        }

        if (this.code.learnUrl != null) {
            lines.push(`${chalk.dim("see:")} ${chalk.blue.underline(this.code.learnUrl)}`);
        }

        return lines.join("\n");
    }

    private formatHeader(): string {
        return `${chalk.red.bold(`error[${this.code.code}]`)}${chalk.bold(":")} ${chalk.bold(this.code.title)}`;
    }

    private formatLocationLine(): string {
        const parts = [this.displayRelativeFilepath];
        if (this.line != null) {
            parts.push(String(this.line));
            if (this.column != null) {
                parts.push(String(this.column));
            }
        }
        return ` ${chalk.cyan("-->")} ${parts.join(":")}`;
    }

    private computeGutterWidth(): number {
        if (this.sourceLines.length === 0) {
            return 1;
        }
        const maxLine = Math.max(...this.sourceLines.map((l) => l.lineNumber));
        return Math.max(1, String(maxLine).length);
    }

    private formatSourceLine(sourceLine: SourceLine, gutterWidth: number): string {
        const lineNumStr = String(sourceLine.lineNumber).padStart(gutterWidth, " ");
        // Tabs render as 4 spaces visually, both for alignment and caret math.
        const displayContent = sourceLine.content.replace(/\t/g, "    ");
        const gutter = `${chalk.cyan(lineNumStr)} ${chalk.cyan("|")}`;
        return sourceLine.isErrorLine ? `${gutter} ${displayContent}` : `${gutter} ${chalk.dim(displayContent)}`;
    }

    private formatCaretLine(errorLine: SourceLine, gutterWidth: number): string | undefined {
        if (this.column == null || this.column < 1) {
            return undefined;
        }
        const visualColumn = computeVisualColumn(errorLine.content, this.column - 1);
        const padding = " ".repeat(visualColumn);
        const gutter = `${" ".repeat(gutterWidth)} ${chalk.cyan("|")}`;
        const caret = chalk.red.bold("^");
        const message = chalk.red(this.code.title);
        return `${gutter} ${padding}${caret} ${message}`;
    }

    private formatFixLine(fix: MdxFix): string {
        return `${chalk.green.bold("fix:")} ${chalk.red(fix.before)} ${chalk.dim("→")} ${chalk.green(fix.after)}`;
    }
}

/**
 * Translate a 0-based character index into a 0-based visual column,
 * expanding tabs to 4 spaces.
 */
function computeVisualColumn(text: string, charIndex: number, tabWidth = 4): number {
    let visualColumn = 0;
    const limit = Math.min(charIndex, text.length);
    for (let i = 0; i < limit; i++) {
        visualColumn += text[i] === "\t" ? tabWidth : 1;
    }
    return visualColumn;
}
