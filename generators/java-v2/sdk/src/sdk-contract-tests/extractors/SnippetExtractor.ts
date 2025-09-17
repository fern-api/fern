import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Extracts method calls from generated Java snippets for use in contract tests.
 * Handles complex multi-line method calls with proper indentation and bracket balancing.
 */
export class SnippetExtractor {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Extracts a clean client method call from a full Java snippet.
     * Removes package declarations, imports, and class wrappers to get just the client invocation.
     *
     * @param fullSnippet The complete Java snippet including class wrapper
     * @returns The extracted client method call
     */
    public extractMethodCall(fullSnippet: string): string {
        const bounds = this.findClientCallBounds(fullSnippet);
        if (!bounds) {
            this.context.logger.debug("Could not find client call boundaries, using full snippet");
            return fullSnippet;
        }

        const extractedLines = this.extractMethodCallLines(fullSnippet, bounds);
        return this.formatExtractedMethodCall(extractedLines);
    }

    /**
     * Finds the start and end indices of the client method call in the snippet.
     */
    private findClientCallBounds(fullSnippet: string): { start: number; end: number } | undefined {
        const lines = fullSnippet.split("\n");
        let startLine = -1;
        let endLine = -1;

        // Find start of client call
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line && (line.includes("client.") || line.includes("= client."))) {
                startLine = i;
                break;
            }
        }

        if (startLine === -1) {
            return undefined;
        }

        // Find end of client call by tracking parentheses and semicolons
        let openParens = 0;
        let openBraces = 0;
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i] ?? "";

            // Track parentheses and braces
            for (const char of line) {
                if (char === '(') openParens++;
                if (char === ')') openParens--;
                if (char === '{') openBraces++;
                if (char === '}') openBraces--;
            }

            // Method call ends with semicolon when parentheses are balanced
            if (line.includes(';') && openParens === 0 && openBraces === 0) {
                endLine = i;
                break;
            }
        }

        return endLine !== -1 ? { start: startLine, end: endLine } : undefined;
    }

    /**
     * Extracts the lines containing the method call from the snippet.
     */
    private extractMethodCallLines(
        fullSnippet: string,
        bounds: { start: number; end: number }
    ): string[] {
        const lines = fullSnippet.split("\n");
        const methodLines: string[] = [];

        for (let i = bounds.start; i <= bounds.end; i++) {
            const line = lines[i];
            if (line !== undefined) {
                // Remove leading whitespace but preserve relative indentation
                const trimmedLine = i === bounds.start ? line.trim() : line;
                methodLines.push(trimmedLine);
            }
        }

        return methodLines;
    }

    /**
     * Formats the extracted method call lines into a clean string.
     */
    private formatExtractedMethodCall(methodLines: string[]): string {
        if (methodLines.length === 0) {
            return "";
        }

        // Find minimum indentation (excluding first line which is already trimmed)
        let minIndent = Infinity;
        for (let i = 1; i < methodLines.length; i++) {
            const line = methodLines[i];
            if (line && line.trim().length > 0) {
                const leadingSpaces = line.length - line.trimStart().length;
                minIndent = Math.min(minIndent, leadingSpaces);
            }
        }

        // Adjust indentation for all lines
        const adjustedLines = methodLines.map((line, index) => {
            if (index === 0 || !line.trim()) {
                return line;
            }
            if (minIndent !== Infinity && minIndent > 0) {
                // Remove excess indentation
                return line.substring(minIndent);
            }
            return line;
        });

        return adjustedLines.join("\n");
    }
}