import stripAnsi from "strip-ansi";

/**
 * adds a prefix to a log, and indents all other lines by the length of the prefix
 */
export function addPrefixToLog({ prefix, content }: { prefix: string; content: string }): string {
    const prefixLength = stripAnsi(prefix).length;
    return `${prefix}${content.replaceAll("\n", `\n${" ".repeat(prefixLength)}`)}`;
}
