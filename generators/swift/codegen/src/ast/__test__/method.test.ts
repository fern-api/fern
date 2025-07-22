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
                    swift.functionParameter({
                        unsafeName: "value",
                        type: Type.string()
                    })
                ],
                returnType: Type.void()
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
                    swift.functionParameter({
                        unsafeName: "id",
                        type: Type.int()
                    }),
                    swift.functionParameter({
                        unsafeName: "name",
                        type: Type.string()
                    }),
                    swift.functionParameter({
                        unsafeName: "email",
                        type: Type.string()
                    })
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
                    swift.functionParameter({
                        argumentLabel: "with",
                        unsafeName: "name",
                        type: Type.string()
                    }),
                    swift.functionParameter({
                        argumentLabel: "email",
                        unsafeName: "emailAddress",
                        type: Type.string()
                    })
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
                    swift.functionParameter({
                        unsafeName: "id",
                        type: Type.int()
                    }),
                    swift.functionParameter({
                        argumentLabel: "includingDeleted",
                        unsafeName: "deleted",
                        type: Type.optional(Type.bool())
                    })
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
                    swift.functionParameter({
                        unsafeName: "value",
                        type: Type.string()
                    }),
                    swift.functionParameter({
                        argumentLabel: "with",
                        unsafeName: "options",
                        type: Type.array(Type.string())
                    }),
                    swift.functionParameter({
                        argumentLabel: "timeout",
                        unsafeName: "timeoutValue",
                        type: Type.optional(Type.double())
                    })
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
                    swift.functionParameter({
                        unsafeName: "enum",
                        type: Type.string()
                    }),
                    swift.functionParameter({
                        argumentLabel: "for",
                        unsafeName: "struct",
                        type: Type.custom("Config")
                    })
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
                    swift.functionParameter({
                        argumentLabel: "name",
                        unsafeName: "name",
                        type: Type.string()
                    })
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
                    swift.functionParameter({
                        argumentLabel: "from",
                        unsafeName: "data",
                        type: Type.custom("Data")
                    }),
                    swift.functionParameter({
                        argumentLabel: "with",
                        unsafeName: "options",
                        type: Type.optional(Type.array(Type.string()))
                    })
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
                    swift.functionParameter({
                        argumentLabel: "with",
                        unsafeName: "name",
                        type: Type.string()
                    }),
                    swift.functionParameter({
                        argumentLabel: "email",
                        unsafeName: "emailAddress",
                        type: Type.optional(Type.string()),
                        defaultValue: swift.Expression.rawValue("nil")
                    }),
                    swift.functionParameter({
                        argumentLabel: "isActive",
                        unsafeName: "active",
                        type: Type.bool(),
                        defaultValue: swift.Expression.rawValue("true")
                    })
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

        it("should write method with body", () => {
            const method = swift.method({
                unsafeName: "getUserName",
                returnType: Type.string(),
                body: swift.CodeBlock.withStatements([
                    swift.Statement.constantDeclaration("name", swift.Expression.rawStringValue("John Appleseed")),
                    swift.Statement.return(swift.Expression.rawValue("name"))
                ])
            });

            expect(method.toString()).toMatchInlineSnapshot(`
              "func getUserName() -> String {
                  let name = "John Appleseed"
                  return name
              }"
            `);
        });
    });
});
