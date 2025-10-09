import { swift } from "../../..";
import { AccessLevel } from "../../AccessLevel";

describe("EnumWithAssociatedValues", () => {
    describe("write", () => {
        it("should write basic enum with associated values", () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "NetworkResponse",
                cases: [
                    { unsafeName: "success", associatedValue: [swift.Type.string()] },
                    { unsafeName: "error", associatedValue: [swift.Type.int(), swift.Type.string()] }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum NetworkResponse {
                  case success(String)
                  case error(Int, String)
              }"
            `);
        });

        it("should write enum with access level and conformances", () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "Result",
                accessLevel: AccessLevel.Public,
                conformances: [swift.Protocol.Codable, swift.Protocol.Equatable],
                cases: [
                    { unsafeName: "success", associatedValue: [swift.Type.string()] },
                    { unsafeName: "failure", associatedValue: [swift.Type.string()] }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "public enum Result: Codable, Equatable {
                  case success(String)
                  case failure(String)
              }"
            `);
        });

        it("should handle complex associated values", () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "ComplexEnum",
                cases: [
                    {
                        unsafeName: "complex",
                        associatedValue: [
                            swift.Type.array(swift.Type.string()),
                            swift.Type.dictionary(swift.Type.string(), swift.Type.int()),
                            swift.Type.tuple([swift.Type.string(), swift.Type.bool()])
                        ]
                    }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum ComplexEnum {
                  case complex([String], [String: Int], (String, Bool))
              }"
            `);
        });

        it("should handle reserved keywords in case names", () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "KeywordEnum",
                cases: [
                    { unsafeName: "class", associatedValue: [swift.Type.string()] },
                    { unsafeName: "struct", associatedValue: [swift.Type.int()] }
                ]
            });

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum KeywordEnum {
                  case \`class\`(String)
                  case \`struct\`(Int)
              }"
            `);
        });

        it("should write enum with methods", async () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "Result",
                accessLevel: AccessLevel.Public,
                conformances: [swift.Protocol.Equatable],
                cases: [
                    { unsafeName: "success", associatedValue: [swift.Type.string()] },
                    { unsafeName: "failure", associatedValue: [swift.Type.string()] }
                ],
                methods: [
                    swift.method({
                        unsafeName: "isSuccess",
                        accessLevel: AccessLevel.Public,
                        returnType: swift.TypeReference.type(swift.Type.bool()),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("switch self {");
                            writer.writeLine("case .success:");
                            writer.writeLine("    return true");
                            writer.writeLine("case .failure:");
                            writer.writeLine("    return false");
                            writer.writeLine("}");
                        })
                    }),
                    swift.method({
                        unsafeName: "getValue",
                        accessLevel: AccessLevel.Public,
                        returnType: swift.TypeReference.type(swift.Type.optional(swift.Type.string())),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("switch self {");
                            writer.writeLine("case .success(let value):");
                            writer.writeLine("    return value");
                            writer.writeLine("case .failure:");
                            writer.writeLine("    return nil");
                            writer.writeLine("}");
                        })
                    })
                ]
            });

            await expect(enum_.toString()).toMatchFileSnapshot("snapshots/enum_with_methods.swift");
        });

        it("should write enum with initializers", async () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "NetworkResponse",
                accessLevel: AccessLevel.Public,
                cases: [
                    { unsafeName: "success", associatedValue: [swift.Type.string()] },
                    { unsafeName: "error", associatedValue: [swift.Type.int(), swift.Type.string()] }
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "successValue",
                                unsafeName: "value",
                                type: swift.TypeReference.type(swift.Type.string())
                            })
                        ],
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("self = .success(value)");
                        })
                    }),
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        failable: true,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "from",
                                unsafeName: "dictionary",
                                type: swift.TypeReference.type(
                                    swift.Type.dictionary(swift.Type.string(), swift.Type.any())
                                )
                            })
                        ],
                        body: swift.codeBlock((writer) => {
                            writer.writeLine('if let value = dictionary["success"] as? String {');
                            writer.writeLine("    self = .success(value)");
                            writer.writeLine('} else if let code = dictionary["errorCode"] as? Int,');
                            writer.writeLine('          let message = dictionary["errorMessage"] as? String {');
                            writer.writeLine("    self = .error(code, message)");
                            writer.writeLine("} else {");
                            writer.writeLine("    return nil");
                            writer.writeLine("}");
                        })
                    })
                ]
            });

            await expect(enum_.toString()).toMatchFileSnapshot("snapshots/enum_with_initializers.swift");
        });

        it("should write enum with nested types", async () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "APIResponse",
                accessLevel: AccessLevel.Public,
                conformances: [swift.Protocol.Codable],
                cases: [
                    { unsafeName: "success", associatedValue: [swift.Type.custom("Data")] },
                    { unsafeName: "error", associatedValue: [swift.Type.custom("ErrorInfo")] }
                ],
                nestedTypes: [
                    swift.struct({
                        name: "Data",
                        accessLevel: AccessLevel.Public,
                        conformances: [swift.Protocol.Codable],
                        properties: [
                            swift.property({
                                unsafeName: "id",
                                declarationType: swift.DeclarationType.Let,
                                type: swift.TypeReference.type(swift.Type.string())
                            }),
                            swift.property({
                                unsafeName: "value",
                                declarationType: swift.DeclarationType.Let,
                                type: swift.TypeReference.type(swift.Type.string())
                            })
                        ]
                    }),
                    swift.struct({
                        name: "ErrorInfo",
                        accessLevel: AccessLevel.Public,
                        conformances: [swift.Protocol.Codable],
                        properties: [
                            swift.property({
                                unsafeName: "code",
                                declarationType: swift.DeclarationType.Let,
                                type: swift.TypeReference.type(swift.Type.int())
                            }),
                            swift.property({
                                unsafeName: "message",
                                declarationType: swift.DeclarationType.Let,
                                type: swift.TypeReference.type(swift.Type.string())
                            })
                        ]
                    })
                ]
            });

            await expect(enum_.toString()).toMatchFileSnapshot("snapshots/enum_with_nested_types.swift");
        });

        it("should write enum with all features combined", async () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: "CompleteEnum",
                accessLevel: AccessLevel.Public,
                conformances: [swift.Protocol.Codable, swift.Protocol.Equatable],
                cases: [
                    { unsafeName: "loading", associatedValue: [swift.Type.custom("Progress")] },
                    { unsafeName: "loaded", associatedValue: [swift.Type.custom("Content")] },
                    { unsafeName: "failed", associatedValue: [swift.Type.custom("ErrorDetails")] }
                ],
                initializers: [
                    swift.initializer({
                        accessLevel: AccessLevel.Public,
                        parameters: [
                            swift.functionParameter({
                                argumentLabel: "content",
                                unsafeName: "content",
                                type: swift.TypeReference.type(swift.Type.custom("Content"))
                            })
                        ],
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("self = .loaded(content)");
                        })
                    })
                ],
                methods: [
                    swift.method({
                        unsafeName: "isLoading",
                        accessLevel: AccessLevel.Public,
                        returnType: swift.TypeReference.type(swift.Type.bool()),
                        body: swift.codeBlock((writer) => {
                            writer.writeLine("if case .loading = self { return true }");
                            writer.writeLine("return false");
                        })
                    })
                ],
                nestedTypes: [
                    swift.struct({
                        name: "Progress",
                        accessLevel: AccessLevel.Public,
                        conformances: [swift.Protocol.Codable],
                        properties: [
                            swift.property({
                                unsafeName: "percentage",
                                declarationType: swift.DeclarationType.Let,
                                type: swift.TypeReference.type(swift.Type.double())
                            })
                        ]
                    })
                ]
            });

            await expect(enum_.toString()).toMatchFileSnapshot("snapshots/enum_with_all_features.swift");
        });
    });
});
