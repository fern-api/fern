import chalk from "chalk";

export type ColorFunction = (text: string) => string;

export interface FormatMessageOptions {
    /** The message text to format */
    message: string;
    /** Function to apply color to the text */
    colorFn: ColorFunction;
    /** Icon to show before the first line */
    icon?: string;
    /** Base indentation (number of spaces) */
    indent?: number;
    /** Additional indentation for continuation lines */
    continuationIndent?: number;
}

/**
 * Format a potentially multiline message with consistent indentation and coloring.
 *
 * Used for displaying errors, warnings, and other formatted messages in the CLI.
 */
export function formatMessage({
    message,
    colorFn,
    icon,
    indent = 0,
    continuationIndent = 2
}: FormatMessageOptions): string {
    const lines = message.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
        return "";
    }

    const baseIndent = " ".repeat(indent);
    const contIndent = " ".repeat(indent + continuationIndent);

    if (icon != null) {
        const [first, ...rest] = lines;
        const firstLine = `${baseIndent}${icon} ${colorFn(first ?? "")}`;
        const restLines = rest.map((line) => `${contIndent}${colorFn(line)}`).join("\n");
        return restLines.length > 0 ? `${firstLine}\n${restLines}` : firstLine;
    }

    return lines.map((line) => `${baseIndent}${colorFn(line)}`).join("\n");
}

export interface FormatMultilineTextOptions {
    /** The text to format (if undefined, returns empty string) */
    text: string | undefined;
    /** Function to apply color to the text */
    colorFn: ColorFunction;
    /** Icon to show before the first line */
    icon?: string;
    /** Base indentation (number of spaces) */
    baseIndent?: number;
    /** Indentation for continuation lines (number of spaces) */
    continuationIndent?: number;
}

/**
 * Format a multiline message for appending to an existing line.
 * Similar to formatMessage but prefixes each line with newline for concatenation.
 */
export function formatMultilineText({
    text,
    colorFn,
    icon,
    baseIndent = 4,
    continuationIndent = 6
}: FormatMultilineTextOptions): string {
    if (text == null) {
        return "";
    }
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
        return "";
    }

    const baseIndentStr = " ".repeat(baseIndent);
    const contIndentStr = " ".repeat(continuationIndent);

    if (icon != null) {
        const [first, ...rest] = lines;
        const firstLine = `\n${baseIndentStr}${icon} ${colorFn(first ?? "")}`;
        const restLines = rest.map((line) => `\n${contIndentStr}${colorFn(line)}`).join("");
        return firstLine + restLines;
    }
    return lines.map((line) => `\n${baseIndentStr}${colorFn(line)}`).join("");
}

/**
 * Standard icons used across the CLI.
 */
export const Icons = {
    error: chalk.red("\u2717"),
    warning: chalk.yellow("\u26a0"),
    success: chalk.green("\u2713"),
    info: chalk.cyan("\u25c6")
} as const;

/**
 * Standard color functions for severity levels.
 */
export const Colors = {
    error: chalk.red.bind(chalk),
    warning: chalk.yellow.bind(chalk),
    success: chalk.green.bind(chalk),
    info: chalk.cyan.bind(chalk),
    dim: chalk.dim.bind(chalk)
} as const;
