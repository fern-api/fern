import { Writer } from "@fern-api/java-ast/src/ast";
import { WireTestExample } from "../extractors/TestDataExtractor";

/**
 * Validator for HTTP headers in contract tests.
 * Generates assertions to verify that expected headers are present in HTTP requests.
 */
export class HeaderValidator {
    /**
     * Generates header validation assertions for a test method.
     * Validates that all expected headers from the test example are present in the recorded request.
     */
    public generateHeaderValidation(writer: Writer, testExample: WireTestExample): void {
        const expectedHeaders = testExample.request.headers;

        if (!expectedHeaders || Object.keys(expectedHeaders).length === 0) {
            return;
        }

        writer.writeLine("");
        writer.writeLine("// Validate headers");

        for (const [headerName, expectedValue] of Object.entries(expectedHeaders)) {
            if (expectedValue !== undefined && expectedValue !== null) {
                const escapedValue = this.escapeJavaString(expectedValue.toString());
                writer.writeLine(
                    `Assertions.assertEquals("${escapedValue}", request.getHeader("${headerName}"), ` +
                    `"Header '${headerName}' should match expected value");`
                );
            }
        }
    }

    /**
     * Escapes a string for safe use in Java string literals.
     * Handles special characters like quotes, newlines, tabs, etc.
     */
    private escapeJavaString(str: string): string {
        return str
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/\f/g, "\\f");
    }
}