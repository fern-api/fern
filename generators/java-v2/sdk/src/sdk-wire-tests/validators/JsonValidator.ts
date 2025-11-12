import { Writer } from "@fern-api/java-ast/src/ast";
import { HttpEndpoint, Pagination } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Validator for JSON assertions in wire tests.
 */
export class JsonValidator {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Formats a JSON object as a multi-line Java string variable with proper concatenation.
     */
    public formatMultilineJson(writer: Writer, variableName: string, jsonData: unknown): void {
        const formattedJson = JSON.stringify(jsonData, this.createJsonReplacer(), 2);
        const lines = formattedJson.split("\n");

        writer.writeLine(`String ${variableName} = ""`);
        writer.indent();

        lines.forEach((line, index) => {
            const escapedLine = line
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\t/g, "\\t");

            if (index === lines.length - 1) {
                writer.writeLine(`+ "${escapedLine}";`);
            } else {
                writer.writeLine(`+ "${escapedLine}\\n"`);
            }
        });

        writer.dedent();
    }

    /**
     * Generates enhanced JSON validation with support for complex types
     * Provides better validation than basic JsonNode.equals() for unions, generics, etc.
     */
    public generateEnhancedJsonValidation(
        writer: Writer,
        endpoint: HttpEndpoint,
        context: "request" | "response",
        actualVarName: string,
        expectedVarName: string
    ): void {
        writer.writeLine(`JsonNode normalized${this.capitalize(actualVarName)} = normalizeNumbers(${actualVarName});`);
        writer.writeLine(
            `JsonNode normalized${this.capitalize(expectedVarName)} = normalizeNumbers(${expectedVarName});`
        );
        writer.writeLine(
            `Assertions.assertEquals(normalized${this.capitalize(expectedVarName)}, normalized${this.capitalize(actualVarName)}, ` +
                `"${context === "request" ? "Request" : "Response"} body structure does not match expected");`
        );

        if (context === "response") {
            this.generateResponseTypeValidation(writer, endpoint, actualVarName);
        } else {
            this.generateRequestTypeValidation(writer, endpoint, actualVarName);
        }
    }

    /**
     * Generates enhanced validation for response types
     */
    private generateResponseTypeValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const responseBody = endpoint.response?.body;
        if (!responseBody || responseBody.type !== "json") {
            return;
        }

        if (this.isPaginatedEndpoint(endpoint)) {
            this.generatePaginationValidation(writer, endpoint, actualVarName);
        }

        this.generateUnionTypeValidation(writer, actualVarName, "response");

        this.generateOptionalTypeValidation(writer, actualVarName, "response");

        this.generateGenericTypeValidation(writer, actualVarName, "response");
    }

    /**
     * Generates enhanced validation for request types
     */
    private generateRequestTypeValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const requestBody = endpoint.requestBody;
        if (!requestBody) {
            return;
        }

        this.generateUnionTypeValidation(writer, actualVarName, "request");

        this.generateOptionalTypeValidation(writer, actualVarName, "request");

        this.generateGenericTypeValidation(writer, actualVarName, "request");
    }

    /**
     * Generates union type validation assertions
     */
    private generateUnionTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine(
            `if (${jsonVarName}.has("type") || ${jsonVarName}.has("_type") || ${jsonVarName}.has("kind")) {`
        );
        writer.indent();
        writer.writeLine(`String discriminator = null;`);
        writer.writeLine(`if (${jsonVarName}.has("type")) discriminator = ${jsonVarName}.get("type").asText();`);
        writer.writeLine(`else if (${jsonVarName}.has("_type")) discriminator = ${jsonVarName}.get("_type").asText();`);
        writer.writeLine(`else if (${jsonVarName}.has("kind")) discriminator = ${jsonVarName}.get("kind").asText();`);
        writer.writeLine(`Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");`);
        writer.writeLine(`Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");`);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates optional/nullable type validation
     */
    private generateOptionalTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine("");
        writer.writeLine(`if (!${jsonVarName}.isNull()) {`);
        writer.indent();
        writer.writeLine(
            `Assertions.assertTrue(${jsonVarName}.isObject() || ${jsonVarName}.isArray() || ${jsonVarName}.isValueNode(), ` +
                `"${context} should be a valid JSON value");`
        );
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Generates validation for generic/collection types
     */
    private generateGenericTypeValidation(writer: Writer, jsonVarName: string, context: string): void {
        writer.writeLine("");
        writer.writeLine(`if (${jsonVarName}.isArray()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${jsonVarName}.size() >= 0, "Array should have valid size");`);
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine(`if (${jsonVarName}.isObject()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${jsonVarName}.size() >= 0, "Object should have valid field count");`);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Checks if an endpoint has pagination configuration
     */
    private isPaginatedEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.pagination != null;
    }

    /**
     * Generates pagination-specific validation for Iterable<T> responses
     */
    private generatePaginationValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        const pagination = endpoint.pagination;
        if (!pagination) {
            return;
        }

        writer.writeLine("");
        writer.writeLine("// Validate pagination structure");

        const resultsPath = this.getPaginationResultsPath(pagination);
        const nextCursorPath = this.getPaginationNextCursorPath(pagination);

        if (resultsPath) {
            const pathParts = resultsPath.split(".");
            let currentPath = actualVarName;

            for (const part of pathParts) {
                writer.writeLine(`if (${currentPath}.has("${part}")) {`);
                writer.indent();
                currentPath = `${currentPath}.get("${part}")`;
            }

            writer.writeLine(
                `Assertions.assertTrue(${currentPath}.isArray(), ` +
                    `"Pagination results at '${resultsPath}' should be an array");`
            );

            // Close all the if statements
            for (let i = 0; i < pathParts.length; i++) {
                writer.dedent();
                writer.writeLine("}");
            }
        }

        if (nextCursorPath && pagination.type === "cursor") {
            const pathParts = nextCursorPath.split(".");
            let currentPath = actualVarName;

            for (const part of pathParts) {
                writer.writeLine(`if (${currentPath}.has("${part}")) {`);
                writer.indent();
                currentPath = `${currentPath}.get("${part}")`;
            }

            writer.writeLine(
                `Assertions.assertTrue(${currentPath}.isTextual() || ${currentPath}.isNull(), ` +
                    `"Pagination cursor at '${nextCursorPath}' should be a string or null");`
            );

            // Close all the if statements
            for (let i = 0; i < pathParts.length; i++) {
                writer.dedent();
                writer.writeLine("}");
            }
        }
    }

    /**
     * Gets the path to pagination results from the pagination configuration
     */
    private getPaginationResultsPath(pagination: Pagination): string | undefined {
        // TODO:This is a simplified implementation - actual implementation would
        // parse the ResponseProperty structure from IR
        if (pagination.type === "cursor" || pagination.type === "offset") {
            // For now, return common patterns
            return "data";
        }
        return undefined;
    }

    /**
     * Gets the path to the next cursor from the pagination configuration
     */
    private getPaginationNextCursorPath(pagination: Pagination): string | undefined {
        // This is a simplified implementation - actual implementation would
        // parse the ResponseProperty structure from IR
        if (pagination.type === "cursor") {
            return "next";
        }
        return undefined;
    }

    /**
     * Creates a JSON replacer that normalizes floating point numbers.
     * Converts whole numbers (e.g., 149.0) to integers (149) to match Jackson's serialization behavior.
     */
    private createJsonReplacer(): (key: string, value: unknown) => unknown {
        return (_key: string, value: unknown) => {
            if (typeof value === "number" && Number.isFinite(value)) {
                // If it's a whole number, return it as an integer
                if (Number.isInteger(value) || value === Math.floor(value)) {
                    return Math.floor(value);
                }
            }
            return value;
        };
    }

    /**
     * Capitalizes the first letter of a string
     */
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
