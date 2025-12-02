import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

// RuboCop default line length limit
const MAX_LINE_LENGTH = 120;
// Comment prefix "# " is 2 characters
const COMMENT_PREFIX_LENGTH = 2;

export declare namespace Comment {
    interface Args {
        docs?: string;
    }
}

export class Comment extends AstNode {
    public readonly docs: string | undefined;

    constructor({ docs }: Comment.Args) {
        super();
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.split("\n").forEach((line) => {
                const wrappedLines = this.wrapLine(line, writer);
                wrappedLines.forEach((wrappedLine) => {
                    writer.writeLine(`# ${wrappedLine}`);
                });
            });
        }
    }

    /**
     * Wraps a single line of text to fit within the RuboCop line length limit.
     * Takes into account the current indentation level and the "# " prefix.
     */
    private wrapLine(line: string, writer: Writer): string[] {
        // Calculate available width: max length - indentation - "# " prefix
        const indentWidth = writer.indentLevel * 2; // Ruby uses 2-space indentation
        const availableWidth = MAX_LINE_LENGTH - indentWidth - COMMENT_PREFIX_LENGTH;

        // If the line fits, return it as-is
        if (line.length <= availableWidth) {
            return [line];
        }

        // If available width is too small, just return the line as-is to avoid infinite loops
        if (availableWidth < 20) {
            return [line];
        }

        const words = line.split(/(\s+)/); // Split by whitespace, keeping the whitespace
        const wrappedLines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            // Skip empty strings
            if (word === "") {
                continue;
            }

            // If this is just whitespace and we're at the start of a line, skip it
            if (currentLine === "" && /^\s+$/.test(word)) {
                continue;
            }

            const potentialLine = currentLine + word;

            if (potentialLine.length <= availableWidth) {
                currentLine = potentialLine;
            } else {
                // If we have content, push it and start a new line
                if (currentLine.trim() !== "") {
                    wrappedLines.push(currentLine.trimEnd());
                }
                // Start new line with the current word (trimmed of leading whitespace)
                currentLine = word.trimStart();

                // If a single word is longer than available width, we need to include it anyway
                // to avoid infinite loops (this handles URLs and other long strings)
                if (currentLine.length > availableWidth) {
                    wrappedLines.push(currentLine);
                    currentLine = "";
                }
            }
        }

        // Don't forget the last line
        if (currentLine.trim() !== "") {
            wrappedLines.push(currentLine.trimEnd());
        }

        // If we ended up with no lines (edge case), return the original
        if (wrappedLines.length === 0) {
            return [line];
        }

        return wrappedLines;
    }
}
