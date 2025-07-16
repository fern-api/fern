import stripAnsi from "strip-ansi";

export function addPrefixToString({
    prefix,
    content,
    includePrefixOnAllLines = false
}: {
    prefix: string;
    content: string;
    /**
     * if true, the prefix is included on all lines.
     * if false, all lines after the first are indented by the length of the prefix
     */
    includePrefixOnAllLines?: boolean;
}): string {
    const prefixLength = stripAnsi(prefix).length;
    return `${prefix}${content.replaceAll("\n", `\n${includePrefixOnAllLines ? prefix : " ".repeat(prefixLength)}`)}`;
}
