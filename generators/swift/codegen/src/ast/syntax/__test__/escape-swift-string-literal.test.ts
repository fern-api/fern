import { escapeSwiftStringLiteral } from "../escape-swift-string-literal";

describe("escapeSwiftStringLiteral", () => {
    it("should not modify strings that do not contain special characters", () => {
        expect(escapeSwiftStringLiteral("Hello World")).toBe("Hello World");
    });

    it("should escape double quotes", () => {
        expect(escapeSwiftStringLiteral('"John Appleseed"')).toBe('\\"John Appleseed\\"');
    });
});
