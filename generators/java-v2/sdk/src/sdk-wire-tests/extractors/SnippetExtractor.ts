import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Extractor for processing code snippets and extracting method calls.
 */
export class SnippetExtractor {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Extracts just the client method call from a full Java snippet.
     * Removes client instantiation and imports, returning only the actual method invocation.
     */
    public extractMethodCall(fullSnippet: string, endpoint?: HttpEndpoint): string {
        const lines = fullSnippet.split("\n");
        let clientCallStartIndex = -1;

        if (endpoint) {
            const methodName = endpoint.name.camelCase.safeName;
            const methodRegex = new RegExp(`\\.${methodName}\\s*\\(`);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line && methodRegex.test(line)) {
                    clientCallStartIndex = i;
                    break;
                }
            }
        }

        if (clientCallStartIndex === -1) {
            let clientInstantiationIndex = -1;
            const clientVarRegex = /\b([A-Za-z_]\w*)\s+(\w+)\s*=/;
            let clientVarName = "client";

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) {
                    continue;
                }

                const match = line.match(clientVarRegex);
                if (match && match[2]) {
                    clientVarName = match[2];
                    clientInstantiationIndex = i;
                }

                if (
                    clientInstantiationIndex !== -1 &&
                    i > clientInstantiationIndex &&
                    line.includes(`${clientVarName}.`)
                ) {
                    clientCallStartIndex = i;
                    break;
                }
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

                let inString = false;
                let escapeNext = false;
                let hasSemicolon = false;

                for (let j = 0; j < line.length; j++) {
                    const char = line[j];

                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }

                    if (char === "\\" && inString) {
                        escapeNext = true;
                        continue;
                    }

                    if (char === '"') {
                        inString = !inString;
                        continue;
                    }

                    if (!inString) {
                        if (char === "{") {
                            braceDepth++;
                        } else if (char === "}") {
                            braceDepth--;
                        } else if (char === "(") {
                            parenDepth++;
                        } else if (char === ")") {
                            parenDepth--;
                        } else if (char === ";") {
                            hasSemicolon = true;
                        }
                    }
                }

                if (hasSemicolon && braceDepth === 0 && parenDepth === 0) {
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
     */
    public extractImports(fullSnippet: string): string[] {
        const lines = fullSnippet.split("\n");
        const imports: string[] = [];

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith("public class") || trimmedLine.startsWith("class")) {
                break;
            }

            if (trimmedLine.startsWith("import ")) {
                // Remove 'import ' prefix and ';' suffix
                const importStatement = trimmedLine.substring(7).replace(/;$/, "").trim();

                imports.push(importStatement);
            }
        }

        this.context.logger.debug(`Extracted ${imports.length} imports from snippet`);
        return imports;
    }
}
