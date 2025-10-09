import { describe, expect, it } from "vitest";

import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { DeclarationType } from "../DeclarationType";

describe("Property", () => {
    describe("write", () => {
        it("should write property with all modifiers", () => {
            const property = swift.property({
                unsafeName: "fullProperty",
                accessLevel: AccessLevel.Private,
                static_: true,
                declarationType: DeclarationType.Let,
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.string()))
            });

            expect(property.toString()).toBe("private static let fullProperty: String?");
        });

        it("should write property with different types", () => {
            const testCases = [
                { type: swift.Type.string(), expected: "String" },
                { type: swift.Type.int(), expected: "Int" },
                { type: swift.Type.bool(), expected: "Bool" },
                { type: swift.Type.double(), expected: "Double" },
                { type: swift.Type.array(swift.Type.string()), expected: "[String]" },
                { type: swift.Type.dictionary(swift.Type.string(), swift.Type.int()), expected: "[String: Int]" },
                { type: swift.Type.tuple([swift.Type.string(), swift.Type.int()]), expected: "(String, Int)" }
            ];

            testCases.forEach(({ type, expected }) => {
                const property = swift.property({
                    unsafeName: "testProperty",
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(type)
                });

                expect(property.toString()).toBe(`let testProperty: ${expected}`);
            });
        });

        it("should handle reserved keywords with backticks", () => {
            const reservedKeywords = ["class", "enum", "static", "private", "protocol"];

            reservedKeywords.forEach((keyword) => {
                const property = swift.property({
                    unsafeName: keyword,
                    declarationType: DeclarationType.Let,
                    type: swift.TypeReference.type(swift.Type.string())
                });

                expect(property.toString()).toBe(`let \`${keyword}\`: String`);
            });
        });

        it("should not add backticks to non-reserved keywords", () => {
            const property = swift.property({
                unsafeName: "myProperty",
                declarationType: DeclarationType.Let,
                type: swift.TypeReference.type(swift.Type.string())
            });

            expect(property.toString()).toBe("let myProperty: String");
        });

        it("should handle complex nested types", () => {
            const property = swift.property({
                unsafeName: "complexProperty",
                accessLevel: AccessLevel.Public,
                static_: true,
                declarationType: DeclarationType.Var,
                type: swift.TypeReference.type(
                    swift.Type.optional(
                        swift.Type.array(
                            swift.Type.dictionary(
                                swift.Type.string(),
                                swift.Type.tuple([swift.Type.int(), swift.Type.bool()])
                            )
                        )
                    )
                )
            });

            expect(property.toString()).toBe("public static var complexProperty: [[String: (Int, Bool)]]?");
        });

        it("should handle reserved keyword with all modifiers", () => {
            const property = swift.property({
                unsafeName: "class",
                accessLevel: AccessLevel.Private,
                static_: true,
                declarationType: DeclarationType.Let,
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.string()))
            });

            expect(property.toString()).toBe("private static let `class`: String?");
        });
    });
});
