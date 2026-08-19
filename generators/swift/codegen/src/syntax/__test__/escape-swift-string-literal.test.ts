import { escapeSwiftStringLiteral, escapeSwiftStringLiteralContent } from "../escape-swift-string-literal.js";

describe("escapeSwiftStringLiteral", () => {
    it("should not modify strings that do not contain special characters", () => {
        expect(escapeSwiftStringLiteral("Hello World")).toBe("Hello World");
    });

    it("should escape double quotes", () => {
        expect(escapeSwiftStringLiteral('"John Appleseed"')).toBe('\\"John Appleseed\\"');
    });
});

describe("escapeSwiftStringLiteralContent", () => {
    it("should not modify strings that do not contain special characters", () => {
        expect(escapeSwiftStringLiteralContent("Hello World")).toBe("Hello World");
    });

    it("should escape real newline characters", () => {
        expect(escapeSwiftStringLiteralContent("BEGIN:VEVENT\nDTSTART:20220816T160000\nEND:VEVENT")).toBe(
            "BEGIN:VEVENT\\nDTSTART:20220816T160000\\nEND:VEVENT"
        );
    });

    it("should escape real carriage returns and tabs", () => {
        expect(escapeSwiftStringLiteralContent("a\r\nb\tc")).toBe("a\\r\\nb\\tc");
    });

    it("should escape real backslashes", () => {
        expect(escapeSwiftStringLiteralContent("path\\to\\file")).toBe("path\\\\to\\\\file");
    });

    it("should escape real double quotes", () => {
        expect(escapeSwiftStringLiteralContent('"John Appleseed"')).toBe('\\"John Appleseed\\"');
    });

    it("should escape null bytes", () => {
        expect(escapeSwiftStringLiteralContent("a\0b")).toBe("a\\0b");
    });

    it("should escape other control characters as Unicode escapes", () => {
        expect(escapeSwiftStringLiteralContent("\x01\x0B\x0C\x7F")).toBe("\\u{1}\\u{B}\\u{C}\\u{7F}");
    });

    it("should leave multi-byte unicode characters unchanged", () => {
        expect(escapeSwiftStringLiteralContent("日本語 — emoji 🚀")).toBe("日本語 — emoji 🚀");
    });
});
