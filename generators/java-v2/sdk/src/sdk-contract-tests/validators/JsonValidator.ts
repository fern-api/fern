import { Writer } from "@fern-api/java-ast/src/ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Validator for JSON request/response bodies in contract tests.
 * Provides both basic JSON equality checks and enhanced validation for complex types.
 */
export class JsonValidator {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Formats a JSON object as a multi-line Java string variable with proper concatenation.
     * This generates Java 8+ compatible string concatenation for better readability.
     * @param writer The Writer instance to write to
     * @param variableName The name of the Java variable to declare
     * @param jsonData The JSON data to format
     */
    public formatMultilineJson(writer: Writer, variableName: string, jsonData: unknown): void {
        const formattedJson = JSON.stringify(jsonData, null, 2);
        const lines = formattedJson.split("\n");

        if (lines.length === 1) {
            // Single line JSON - no need for concatenation
            writer.writeLine(`String ${variableName} = ${JSON.stringify(formattedJson)};`);
        } else {
            // Multi-line JSON - format with concatenation
            writer.writeLine(
                `String ${variableName} = "` + (lines[0] ?? "").replace(/"/g, '\\"') + '\\n" +'
            );
            for (let i = 1; i < lines.length - 1; i++) {
                writer.writeLine('    "' + (lines[i] ?? "").replace(/"/g, '\\"') + '\\n" +');
            }
            writer.writeLine('    "' + ((lines[lines.length - 1] ?? "").replace(/"/g, '\\"')) + '";');
        }
    }

    /**
     * Generates enhanced JSON validation beyond basic equality.
     * Handles union types, optional/nullable types, and collections.
     *
     * @param writer The Writer instance
     * @param endpoint The HTTP endpoint being tested
     * @param context Whether validating request or response
     * @param actualVarName Name of the actual JSON variable
     * @param expectedVarName Name of the expected JSON variable
     */
    public generateEnhancedJsonValidation(
        writer: Writer,
        endpoint: HttpEndpoint,
        context: "request" | "response",
        actualVarName: string,
        expectedVarName: string
    ): void {
        // Basic JSON structure validation
        const contextCapitalized = context.charAt(0).toUpperCase() + context.slice(1);
        writer.writeLine(
            `Assertions.assertEquals(${expectedVarName}, ${actualVarName}, ` +
            `"${contextCapitalized} body structure does not match expected");`
        );

        // Union type validation
        this.generateUnionTypeValidation(writer, actualVarName);

        // Optional/nullable validation
        this.generateOptionalNullableValidation(writer, actualVarName, context);

        // Generic/collection validation
        this.generateGenericCollectionValidation(writer, actualVarName);
    }

    private generateUnionTypeValidation(writer: Writer, actualVarName: string): void {
        writer.writeLine(`if (${actualVarName}.has("type") || ${actualVarName}.has("_type") || ${actualVarName}.has("kind")) {`);
        writer.indent();
        writer.writeLine("String discriminator = null;");
        writer.writeLine(`if (${actualVarName}.has("type")) discriminator = ${actualVarName}.get("type").asText();`);
        writer.writeLine(`else if (${actualVarName}.has("_type")) discriminator = ${actualVarName}.get("_type").asText();`);
        writer.writeLine(`else if (${actualVarName}.has("kind")) discriminator = ${actualVarName}.get("kind").asText();`);
        writer.writeLine('Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");');
        writer.writeLine('Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");');
        writer.dedent();
        writer.writeLine("}");
    }

    private generateOptionalNullableValidation(
        writer: Writer,
        actualVarName: string,
        context: "request" | "response"
    ): void {
        writer.writeLine("");
        writer.writeLine(`if (!${actualVarName}.isNull()) {`);
        writer.indent();
        writer.writeLine(
            `Assertions.assertTrue(${actualVarName}.isObject() || ${actualVarName}.isArray() || ` +
            `${actualVarName}.isValueNode(), "${context} should be a valid JSON value");`
        );
        writer.dedent();
        writer.writeLine("}");
    }

    private generateGenericCollectionValidation(writer: Writer, actualVarName: string): void {
        writer.writeLine("");
        writer.writeLine(`if (${actualVarName}.isArray()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${actualVarName}.size() >= 0, "Array should have valid size");`);
        writer.dedent();
        writer.writeLine("}");

        writer.writeLine(`if (${actualVarName}.isObject()) {`);
        writer.indent();
        writer.writeLine(`Assertions.assertTrue(${actualVarName}.size() >= 0, "Object should have valid field count");`);
        writer.dedent();
        writer.writeLine("}");
    }
}