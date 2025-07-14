import { describe, expect, it } from "vitest";

import { swift } from "../..";
import { AccessLevel } from "../AccessLevel";
import { Type } from "../Type";

describe("Method", () => {
    describe("write", () => {
        it("should write basic method with name and return type", () => {
            const method = swift.method({
                unsafeName: "getName",
                returnType: Type.string()
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func getName() -> String {
              }"
            `);
        });

        it("should write method with access level", () => {
            const method = swift.method({
                unsafeName: "getValue",
                accessLevel: AccessLevel.Public,
                returnType: Type.int()
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "public func getValue() -> Int {
              }"
            `);
        });

        it("should write static method", () => {
            const method = swift.method({
                unsafeName: "create",
                static_: true,
                returnType: Type.custom("User")
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "static func create() -> User {
              }"
            `);
        });

        it("should write method with all modifiers", () => {
            const method = swift.method({
                unsafeName: "process",
                accessLevel: AccessLevel.Private,
                static_: true,
                returnType: Type.bool()
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "private static func process() -> Bool {
              }"
            `);
        });

        it("should write method with single unlabeled parameter", () => {
            const method = swift.method({
                unsafeName: "setValue",
                parameters: [
                    {
                        unsafeName: "value",
                        type: Type.string()
                    }
                ],
                returnType: Type.custom("Void")
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func setValue(_ value: String) -> Void {
              }"
            `);
        });

        it("should write method with multiple unlabeled parameters", () => {
            const method = swift.method({
                unsafeName: "updateUser",
                parameters: [
                    {
                        unsafeName: "id",
                        type: Type.int()
                    },
                    {
                        unsafeName: "name",
                        type: Type.string()
                    },
                    {
                        unsafeName: "email",
                        type: Type.string()
                    }
                ],
                returnType: Type.bool()
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "func updateUser(_ id: Int, _ name: String, _ email: String) -> Bool {
              }"
            `
            );
        });

        it("should write method with argument labels", () => {
            const method = swift.method({
                unsafeName: "createUser",
                parameters: [
                    {
                        argumentLabel: "with",
                        unsafeName: "name",
                        type: Type.string()
                    },
                    {
                        argumentLabel: "email",
                        unsafeName: "emailAddress",
                        type: Type.string()
                    }
                ],
                returnType: Type.custom("User")
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "func createUser(with name: String, email emailAddress: String) -> User {
              }"
            `
            );
        });

        it("should write method with optional parameters", () => {
            const method = swift.method({
                unsafeName: "findUser",
                parameters: [
                    {
                        unsafeName: "id",
                        type: Type.int()
                    },
                    {
                        argumentLabel: "includingDeleted",
                        unsafeName: "deleted",
                        type: Type.bool(),
                        optional: true
                    }
                ],
                returnType: Type.custom("User?")
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "func findUser(_ id: Int, includingDeleted deleted: Bool?) -> User? {
              }"
            `
            );
        });

        it("should write method with mixed parameter configurations", () => {
            const method = swift.method({
                unsafeName: "complexMethod",
                accessLevel: AccessLevel.Public,
                parameters: [
                    {
                        unsafeName: "value",
                        type: Type.string()
                    },
                    {
                        argumentLabel: "with",
                        unsafeName: "options",
                        type: Type.array(Type.string())
                    },
                    {
                        argumentLabel: "timeout",
                        unsafeName: "timeoutValue",
                        type: Type.double(),
                        optional: true
                    }
                ],
                returnType: Type.dictionary(Type.string(), Type.any())
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "public func complexMethod(_ value: String, with options: [String], timeout timeoutValue: Double?) -> [String: Any] {
              }"
            `
            );
        });

        it("should write method with reserved keyword name", () => {
            const method = swift.method({
                unsafeName: "class",
                returnType: Type.string()
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func \`class\`() -> String {
              }"
            `);
        });

        it("should write method with reserved keyword parameters", () => {
            const method = swift.method({
                unsafeName: "configure",
                parameters: [
                    {
                        unsafeName: "enum",
                        type: Type.string()
                    },
                    {
                        argumentLabel: "for",
                        unsafeName: "struct",
                        type: Type.custom("Config")
                    }
                ],
                returnType: Type.string()
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "func configure(_ enum: String, for struct: Config) -> String {
              }"
            `
            );
        });

        it("should write method with complex return types", () => {
            const method = swift.method({
                unsafeName: "getComplexData",
                returnType: Type.array(Type.dictionary(Type.string(), Type.tuple([Type.int(), Type.bool()])))
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func getComplexData() -> [[String: (Int, Bool)]] {
              }"
            `);
        });

        it("should combine argument label and parameter name if they are the same", () => {
            const method = swift.method({
                unsafeName: "setName",
                parameters: [
                    {
                        argumentLabel: "name",
                        unsafeName: "name",
                        type: Type.string()
                    }
                ],
                returnType: Type.any()
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func setName(name: String) -> Any {
              }"
            `);
        });

        it("should write complex static method with all features", () => {
            const method = swift.method({
                unsafeName: "createInstance",
                accessLevel: AccessLevel.Public,
                static_: true,
                parameters: [
                    {
                        argumentLabel: "from",
                        unsafeName: "data",
                        type: Type.custom("Data")
                    },
                    {
                        argumentLabel: "with",
                        unsafeName: "options",
                        type: Type.array(Type.string()),
                        optional: true
                    }
                ],
                returnType: Type.string()
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "public static func createInstance(from data: Data, with options: [String]?) -> String {
              }"
            `
            );
        });

        it("should write method with default parameter values", () => {
            const method = swift.method({
                unsafeName: "createUser",
                accessLevel: AccessLevel.Public,
                parameters: [
                    {
                        argumentLabel: "with",
                        unsafeName: "name",
                        type: Type.string()
                    },
                    {
                        argumentLabel: "email",
                        unsafeName: "emailAddress",
                        type: Type.string(),
                        optional: true,
                        defaultRawValue: "nil"
                    },
                    {
                        argumentLabel: "isActive",
                        unsafeName: "active",
                        type: Type.bool(),
                        defaultRawValue: "true"
                    }
                ],
                returnType: Type.custom("User")
            });

            expect(method.toString()).toMatchInlineSnapshot(
                `
              "public func createUser(with name: String, email emailAddress: String? = nil, isActive active: Bool = true) -> User {
              }"
            `
            );
        });
    });
});
