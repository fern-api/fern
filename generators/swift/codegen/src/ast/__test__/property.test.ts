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
                type: swift.TypeReference.optional(swift.TypeReference.unqualifiedToSwiftType("String"))
            });

            expect(property.toString()).toBe("private static let fullProperty: String?");
        });

        it("should write property with different types", () => {
            const testCases = [
                { type: swift.TypeReference.unqualifiedToSwiftType("String"), expected: "String" },
                { type: swift.TypeReference.unqualifiedToSwiftType("Int"), expected: "Int" },
                { type: swift.TypeReference.unqualifiedToSwiftType("Bool"), expected: "Bool" },
                { type: swift.TypeReference.unqualifiedToSwiftType("Double"), expected: "Double" },
                {
                    type: swift.TypeReference.array(swift.TypeReference.unqualifiedToSwiftType("String")),
                    expected: "[String]"
                },
                {
                    type: swift.TypeReference.dictionary(
                        swift.TypeReference.unqualifiedToSwiftType("String"),
                        swift.TypeReference.unqualifiedToSwiftType("Int")
                    ),
                    expected: "[String: Int]"
                },
                {
                    type: swift.TypeReference.tuple([
                        swift.TypeReference.unqualifiedToSwiftType("String"),
                        swift.TypeReference.unqualifiedToSwiftType("Int")
                    ]),
                    expected: "(String, Int)"
                }
            ];

            testCases.forEach(({ type, expected }) => {
                const property = swift.property({
                    unsafeName: "testProperty",
                    declarationType: DeclarationType.Let,
                    type
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
                    type: swift.TypeReference.unqualifiedToSwiftType("String")
                });

                expect(property.toString()).toBe(`let \`${keyword}\`: String`);
            });
        });

        it("should not add backticks to non-reserved keywords", () => {
            const property = swift.property({
                unsafeName: "myProperty",
                declarationType: DeclarationType.Let,
                type: swift.TypeReference.unqualifiedToSwiftType("String")
            });

            expect(property.toString()).toBe("let myProperty: String");
        });

        it("should handle complex nested types", () => {
            const property = swift.property({
                unsafeName: "complexProperty",
                accessLevel: AccessLevel.Public,
                static_: true,
                declarationType: DeclarationType.Var,
                type: swift.TypeReference.optional(
                    swift.TypeReference.array(
                        swift.TypeReference.dictionary(
                            swift.TypeReference.unqualifiedToSwiftType("String"),
                            swift.TypeReference.tuple([
                                swift.TypeReference.unqualifiedToSwiftType("Int"),
                                swift.TypeReference.unqualifiedToSwiftType("Bool")
                            ])
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
                type: swift.TypeReference.optional(swift.TypeReference.unqualifiedToSwiftType("String"))
            });

            expect(property.toString()).toBe("private static let `class`: String?");
        });
    });
});
