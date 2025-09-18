import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Extractor for processing code snippets and extracting method calls.
 */
export class SnippetExtractor {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Extracts just the client method call from a full Java snippet.
     * Removes client instantiation and imports, returning only the actual method invocation.
     *
     * @param fullSnippet The complete Java snippet including imports and client instantiation
     * @returns The extracted client method call or a TODO comment if extraction fails
     */
    public extractMethodCall(fullSnippet: string): string {
        const lines = fullSnippet.split("\n");

        let clientInstantiationIndex = -1;
        let clientCallStartIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) {
                continue;
            }

            if (line.includes("client =") || line.includes("Client client =")) {
                clientInstantiationIndex = i;
            }

            if (clientInstantiationIndex !== -1 && i > clientInstantiationIndex && line.includes("client.")) {
                clientCallStartIndex = i;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            this.context.logger.debug("Could not find client method call in snippet");
            return "// TODO: Add client call";
        }

        const methodCallLines: string[] = [];
        let braceDepth = 0;
        let parenDepth = 0;
        let foundSemicolon = false;

        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (!line && methodCallLines.length === 0) {
                continue;
            }

            if (line !== undefined) {
                methodCallLines.push(line);

                for (const char of line) {
                    if (char === "{") {
                        braceDepth++;
                    } else if (char === "}") {
                        braceDepth--;
                    } else if (char === "(") {
                        parenDepth++;
                    } else if (char === ")") {
                        parenDepth--;
                    }
                }

                if (line.includes(";") && braceDepth === 0 && parenDepth === 0) {
                    foundSemicolon = true;
                    break;
                }
            }
        }

        if (!foundSemicolon || methodCallLines.length === 0) {
            this.context.logger.debug("Could not extract complete method call");
            return "// TODO: Add client call";
        }

        const nonEmptyLines = methodCallLines.filter((line) => line && line.trim().length > 0);
        if (nonEmptyLines.length === 0) {
            return "// TODO: Add client call";
        }

        const minIndent = Math.min(
            ...nonEmptyLines.map((line) => {
                if (!line) {
                    return 0;
                }
                const match = line.match(/^(\s*)/);
                return match?.[1]?.length ?? 0;
            })
        );

        const cleanedLines = methodCallLines.map((line) =>
            line && line.length > minIndent ? line.substring(minIndent) : line || ""
        );

        const result = cleanedLines.join("\n").trim();
        this.context.logger.debug(`Extracted method call: ${result}`);
        return result;
    }

    /**
     * Extracts import statements from a full Java snippet.
     *
     * Note: We don't filter imports here - the Writer class handles deduplication
     * automatically via its internal Set, so we just collect all imports and let
     * the system handle it properly.
     *
     * @param fullSnippet The complete Java snippet including imports and class definition
     * @returns An array of import statements (without the 'import' keyword and semicolon)
     */
    public extractImports(fullSnippet: string): string[] {
        const lines = fullSnippet.split("\n");
        const imports: string[] = [];

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Stop when we hit the class declaration
            if (trimmedLine.startsWith("public class") || trimmedLine.startsWith("class")) {
                break;
            }

            // Extract import statements
            if (trimmedLine.startsWith("import ")) {
                // Remove 'import ' prefix and ';' suffix
                const importStatement = trimmedLine
                    .substring(7) // Remove 'import '
                    .replace(/;$/, '') // Remove trailing semicolon
                    .trim();

                imports.push(importStatement);
            }
        }

        this.context.logger.debug(`Extracted ${imports.length} imports from snippet`);
        return imports;
    }
}
