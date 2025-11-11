/* eslint-disable no-useless-escape */

import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { BaseCsharpCustomConfigSchema } from "../..";
import { Generation } from "../../context/generation-info";
import { String_ } from "../code/String_";

const generation = new Generation(
    {} as unknown as IntermediateRepresentation,
    "",
    {} as BaseCsharpCustomConfigSchema,
    {} as FernGeneratorExec.config.GeneratorConfig
);

describe("String_", () => {
    function getStringOutput(input: string): string {
        const string_ = new String_({ string: input }, generation);
        return string_.toString({
            namespace: "",
            allNamespaceSegments: new Set<string>(),
            allTypeClassReferences: new Map<string, Set<string>>(),
            generation
        });
    }

    it("should escape basic special characters", () => {
        expect(getStringOutput('Hello "World"')).toBe('"Hello \\"World\\""');
        expect(getStringOutput("Hello 'World'")).toBe("\"Hello 'World'\"");
        expect(getStringOutput("Hello\\World")).toBe('"Hello\\\\World"');
    });

    it("should escape newlines and carriage returns", () => {
        expect(getStringOutput("Hello\nWorld")).toBe('"Hello\\nWorld"');
        expect(getStringOutput("Hello\rWorld")).toBe('"Hello\\rWorld"');
        expect(getStringOutput("Hello\r\nWorld")).toBe('"Hello\\r\\nWorld"');
    });

    it("should escape tabs and other whitespace characters", () => {
        expect(getStringOutput("Hello\tWorld")).toBe('"Hello\\tWorld"');
        expect(getStringOutput("Hello\fWorld")).toBe('"Hello\\fWorld"');
        expect(getStringOutput("Hello\u0008World")).toBe('"Hello\\bWorld"'); // backspace
        expect(getStringOutput("Hello\vWorld")).toBe('"Hello\\vWorld"');
    });

    it("should escape null and bell characters", () => {
        expect(getStringOutput("Hello\0World")).toBe('"Hello\\0World"');
        expect(getStringOutput("Hello\u0007World")).toBe('"Hello\\aWorld"'); // Bell character
    });

    it("should escape control characters as unicode escapes", () => {
        // Test various control characters
        expect(getStringOutput("Hello\u0001World")).toBe('"Hello\\u0001World"'); // SOH
        expect(getStringOutput("Hello\u0002World")).toBe('"Hello\\u0002World"'); // STX
        expect(getStringOutput("Hello\u001FWorld")).toBe('"Hello\\u001fWorld"'); // Unit Separator
        expect(getStringOutput("Hello\u007FWorld")).toBe('"Hello\\u007fWorld"'); // DEL
        expect(getStringOutput("Hello\u0080World")).toBe('"Hello\\u0080World"'); // Control character
        expect(getStringOutput("Hello\u009FWorld")).toBe('"Hello\\u009fWorld"'); // Control character
    });

    it("should handle complex strings with multiple escape sequences", () => {
        const complexString = 'Line 1\n"Quote"\tTab\\Backslash\r\nLine 2\0Null';
        expect(getStringOutput(complexString)).toBe('"Line 1\\n\\"Quote\\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null"');
    });

    it("should handle empty string", () => {
        expect(getStringOutput("")).toBe('""');
    });

    it("should handle string with only special characters", () => {
        expect(getStringOutput("\n\r\t\0\u0008\f\v\u0007")).toBe('"\\n\\r\\t\\0\\b\\f\\v\\a"');
    });

    it("should handle strings with unicode characters that don't need escaping", () => {
        expect(getStringOutput("Hello 世界")).toBe('"Hello 世界"');
        expect(getStringOutput("café")).toBe('"café"');
        expect(getStringOutput("🚀")).toBe('"🚀"');
    });

    it("should preserve order of escaping (backslashes first)", () => {
        // This tests that backslashes are escaped before other characters
        // to prevent double-escaping issues
        expect(getStringOutput("\\n")).toBe('"\\\\n"'); // Should be \\\\n, not \\n
        expect(getStringOutput('\\"')).toBe('"\\\\\\\""'); // backslash + quote becomes \\\" (escaped backslash + escaped quote)
    });

    it("should handle JSON-like strings", () => {
        const jsonString = '{"name": "John", "age": 30, "city": "New York"}';
        expect(getStringOutput(jsonString)).toBe(
            '"{\\\"name\\\": \\\"John\\\", \\\"age\\\": 30, \\\"city\\\": \\\"New York\\\"}"'
        );
    });

    it("should handle SQL-like strings", () => {
        const sqlString = "SELECT * FROM users WHERE name = 'John O\\'Reilly'";
        expect(getStringOutput(sqlString)).toBe("\"SELECT * FROM users WHERE name = 'John O\\\\'Reilly'\"");
    });

    it("should handle file paths", () => {
        expect(getStringOutput("C:\\Users\\John\\Documents\\file.txt")).toBe(
            '"C:\\\\Users\\\\John\\\\Documents\\\\file.txt"'
        );
        expect(getStringOutput("/usr/local/bin/app")).toBe('"/usr/local/bin/app"');
    });

    it("should handle regex patterns", () => {
        expect(getStringOutput("\\d{3}-\\d{2}-\\d{4}")).toBe('"\\\\d{3}-\\\\d{2}-\\\\d{4}"');
        expect(getStringOutput("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")).toBe(
            '"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}"'
        );
    });

    it("should handle vapi enum patterns", () => {
        expect(getStringOutput('transcript[transcriptType="final"]')).toBe('"transcript[transcriptType=\\"final\\"]"');
        expect(getStringOutput("transcript[transcriptType='final']")).toBe("\"transcript[transcriptType='final']\"");
    });
});
