import { Writer } from "@fern-api/java-ast/src/ast";
import { WireTestExample } from "../extractors/TestDataExtractor";

/**
 * Validator for HTTP headers in wire tests.
 * Generates assertions to verify that expected headers are present in HTTP requests.
 */
export class HeaderValidator {
    /**
     * Generates header validation assertions for a test method.
     * Validates that all expected headers from the test example are present in the recorded request.
     *
     * Note: The Java SDK sends headers using camelCase names (e.g., "idempotencyKey"),
     * while the OpenAPI spec/IR uses wire format names (e.g., "Idempotency-Key").
     * We validate using the camelCase format that the SDK actually sends.
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
                // Convert wire header name to camelCase as the Java SDK sends headers in camelCase
                const javaHeaderName = this.toJavaHeaderName(headerName);
                writer.writeLine(
                    `Assertions.assertEquals("${escapedValue}", request.getHeader("${javaHeaderName}"), ` +
                        `"Header '${javaHeaderName}' should match expected value");`
                );
            }
        }
    }

    /**
     * Converts a wire header name (e.g., "Idempotency-Key", "Content-Type") to the
     * Java SDK header name format (camelCase, e.g., "idempotencyKey", "contentType").
     *
     * The Java SDK uses camelCase for custom headers while standard HTTP headers
     * like Content-Type and Accept are sent as-is.
     */
    private toJavaHeaderName(wireHeaderName: string): string {
        // Standard HTTP headers should remain as-is
        const standardHeaders = [
            "Content-Type",
            "Accept",
            "Authorization",
            "User-Agent",
            "Host",
            "Content-Length",
            "Cache-Control"
        ];
        if (standardHeaders.includes(wireHeaderName)) {
            return wireHeaderName;
        }

        // Convert kebab-case or other formats to camelCase
        // "Idempotency-Key" -> "idempotencyKey"
        // "X-Custom-Header" -> "xCustomHeader"
        const parts = wireHeaderName.split("-");
        return parts
            .map((part, index) => {
                const lower = part.toLowerCase();
                if (index === 0) {
                    return lower;
                }
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            })
            .join("");
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
