import { describe, expect, it } from "vitest";

import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { DeclarationType } from "../DeclarationType";
import { Type } from "../Type";
import { Writer } from "../core";

describe("Property", () => {
    describe("write", () => {
        it("should write property with all modifiers", () => {
            const writer = new Writer();
            const property = swift.property({
                name: "fullProperty",
                accessLevel: AccessLevel.Private,
                static_: true,
                declarationType: DeclarationType.Let,
                type: Type.string(),
                optional: true
            });

            property.write(writer);

            expect(writer.toString()).toBe("private static let fullProperty: String?");
        });

        it("should write property with different types", () => {
            const testCases = [
                { type: Type.string(), expected: "String" },
                { type: Type.int(), expected: "Int" },
                { type: Type.bool(), expected: "Bool" },
                { type: Type.double(), expected: "Double" },
                { type: Type.array(Type.string()), expected: "[String]" },
                { type: Type.dictionary(Type.string(), Type.int()), expected: "[String: Int]" },
                { type: Type.tuple([Type.string(), Type.int()]), expected: "(String, Int)" }
            ];

            testCases.forEach(({ type, expected }) => {
                const writer = new Writer();
                const property = swift.property({
                    name: "testProperty",
                    declarationType: DeclarationType.Let,
                    type
                });

                property.write(writer);

                expect(writer.toString()).toBe(`let testProperty: ${expected}`);
            });
        });

        it("should handle reserved keywords with backticks", () => {
            const reservedKeywords = ["class", "enum", "static", "private", "protocol"];

            reservedKeywords.forEach((keyword) => {
                const writer = new Writer();
                const property = swift.property({
                    name: keyword,
                    declarationType: DeclarationType.Let,
                    type: Type.string()
                });

                property.write(writer);

                expect(writer.toString()).toBe(`let \`${keyword}\`: String`);
            });
        });

        it("should not add backticks to non-reserved keywords", () => {
            const writer = new Writer();
            const property = swift.property({
                name: "myProperty",
                declarationType: DeclarationType.Let,
                type: Type.string()
            });

            property.write(writer);

            expect(writer.toString()).toBe("let myProperty: String");
        });

        it("should handle complex nested types", () => {
            const writer = new Writer();
            const property = swift.property({
                name: "complexProperty",
                accessLevel: AccessLevel.Public,
                static_: true,
                declarationType: DeclarationType.Var,
                type: Type.array(Type.dictionary(Type.string(), Type.tuple([Type.int(), Type.bool()]))),
                optional: true
            });

            property.write(writer);

            expect(writer.toString()).toBe("public static var complexProperty: [[String: (Int, Bool)]]?");
        });

        it("should handle reserved keyword with all modifiers", () => {
            const writer = new Writer();
            const property = swift.property({
                name: "class",
                accessLevel: AccessLevel.Private,
                static_: true,
                declarationType: DeclarationType.Let,
                type: Type.string(),
                optional: true
            });

            property.write(writer);

            expect(writer.toString()).toBe("private static let `class`: String?");
        });
    });
});
