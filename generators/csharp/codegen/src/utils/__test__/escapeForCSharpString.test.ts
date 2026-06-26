import { escapeForCSharpString } from "../escapeForCSharpString.js";

describe("escapeForCSharpString", () => {
    it("should leave ordinary strings untouched", () => {
        expect(escapeForCSharpString("phone")).toBe("phone");
        expect(escapeForCSharpString("application/json")).toBe("application/json");
        expect(escapeForCSharpString("eyJpZCI6ImFuX2lkIiwidiI6MX0=")).toBe("eyJpZCI6ImFuX2lkIiwidiI6MX0=");
    });

    it("should escape double quotes so the value stays inside a C# string literal", () => {
        expect(escapeForCSharpString('a"b')).toBe('a\\"b');
        expect(escapeForCSharpString('"quoted"')).toBe('\\"quoted\\"');
    });

    it("should escape backslashes", () => {
        expect(escapeForCSharpString("a\\b")).toBe("a\\\\b");
        expect(escapeForCSharpString("C:\\path")).toBe("C:\\\\path");
    });

    it("should escape common whitespace control characters", () => {
        expect(escapeForCSharpString("line1\nline2")).toBe("line1\\nline2");
        expect(escapeForCSharpString("a\rb")).toBe("a\\rb");
        expect(escapeForCSharpString("a\tb")).toBe("a\\tb");
        expect(escapeForCSharpString("a\fb")).toBe("a\\fb");
        expect(escapeForCSharpString("a\vb")).toBe("a\\vb");
        expect(escapeForCSharpString("a\0b")).toBe("a\\0b");
    });

    it("should escape bell and backspace to their named escapes", () => {
        expect(escapeForCSharpString("a\u0007b")).toBe("a\\ab");
        expect(escapeForCSharpString("a\u0008b")).toBe("a\\bb");
    });

    it("should fall back to unicode escapes for other control characters", () => {
        expect(escapeForCSharpString("a\u0001b")).toBe("a\\u0001b");
        expect(escapeForCSharpString("a\u001fb")).toBe("a\\u001fb");
        expect(escapeForCSharpString("a\u007fb")).toBe("a\\u007fb");
    });

    it("should handle empty strings", () => {
        expect(escapeForCSharpString("")).toBe("");
    });

    it("should escape multiple special characters in one value", () => {
        expect(escapeForCSharpString('a"b\\c\nd')).toBe('a\\"b\\\\c\\nd');
    });
});
