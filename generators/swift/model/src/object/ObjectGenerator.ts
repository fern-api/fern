import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";

type ObjectType = "schema" | "inlined-request";

export class ObjectGenerator {
    private readonly name: string;
    private readonly objectType: ObjectType;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties?: ObjectProperty[];
    private readonly additionalPropertiesInfo;

    public constructor(
        name: string,
        objectType: ObjectType,
        properties: (ObjectProperty | InlinedRequestBodyProperty)[],
        extendedProperties?: ObjectProperty[]
    ) {
        this.name = name;
        this.objectType = objectType;
        this.properties = properties;
        this.extendedProperties = extendedProperties;
        this.additionalPropertiesInfo = this.getAdditionalPropertiesInfo(properties);
    }

    private getFileDirectory(): RelativeFilePath {
        switch (this.objectType) {
            case "schema":
                return RelativeFilePath.of("Schemas");
            case "inlined-request":
                return RelativeFilePath.of("Requests");
            default:
                assertNever(this.objectType);
        }
    }

    private getFilename(): string {
        return this.name + ".swift";
    }

    private getAdditionalPropertiesInfo(properties: (ObjectProperty | InlinedRequestBodyProperty)[]) {
        const propertyNames = new Set(properties.map((p) => p.name.name.camelCase.unsafeName));
        let propertyName = "additionalProperties";
        while (propertyNames.has(propertyName)) {
            propertyName = "_" + propertyName;
        }
        return {
            propertyName,
            swiftType: swift.Type.dictionary(swift.Type.string(), swift.Type.custom("JSONValue"))
        };
    }

    public generate(): SwiftFile {
        const swiftStruct = this.generateStructForTypeDeclaration();
        const fileContents = swiftStruct.toString();
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private generateStructForTypeDeclaration(): swift.Struct {
        const codingKeysEnum = this.generateCodingKeysEnum();
        return swift.struct({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable],
            properties: [
                ...this.properties.map((p) => this.generateSwiftPropertyForProperty(p)),
                swift.property({
                    unsafeName: this.additionalPropertiesInfo.propertyName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: this.additionalPropertiesInfo.swiftType
                })
            ],
            initializers: [this.generatePrimaryInitializer(), this.generateInitializerForDecoder()],
            methods: [this.generateEncodeMethod()],
            nestedTypes: codingKeysEnum ? [codingKeysEnum] : undefined
        });
    }

    private generatePrimaryInitializer(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                ...this.properties.map((p) => {
                    const swiftType = getSwiftTypeForTypeReference(p.valueType);
                    return swift.functionParameter({
                        argumentLabel: p.name.name.camelCase.unsafeName,
                        unsafeName: p.name.name.camelCase.unsafeName,
                        type: swiftType,
                        defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined
                    });
                }),
                swift.functionParameter({
                    argumentLabel: this.additionalPropertiesInfo.propertyName,
                    unsafeName: this.additionalPropertiesInfo.propertyName,
                    type: this.additionalPropertiesInfo.swiftType,
                    defaultValue: swift.Expression.contextualMethodCall({ methodName: "init" })
                })
            ],
            body: swift.CodeBlock.withStatements([
                ...this.properties.map((p) =>
                    swift.Statement.propertyAssignment(
                        p.name.name.camelCase.unsafeName,
                        swift.Expression.reference(p.name.name.camelCase.unsafeName)
                    )
                ),
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesInfo.propertyName,
                    swift.Expression.reference(this.additionalPropertiesInfo.propertyName)
                )
            ])
        });
    }

    private generateInitializerForDecoder(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            throws: true,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "from",
                    unsafeName: "decoder",
                    type: swift.Type.custom("Decoder")
                })
            ],
            body: swift.CodeBlock.withStatements([
                ...(this.properties.length > 0
                    ? [
                          swift.Statement.constantDeclaration(
                              "container",
                              swift.Expression.try(
                                  swift.Expression.methodCall({
                                      target: swift.Expression.reference("decoder"),
                                      methodName: "container",
                                      arguments_: [
                                          swift.functionArgument({
                                              label: "keyedBy",
                                              value: swift.Expression.rawValue("CodingKeys.self")
                                          })
                                      ]
                                  })
                              )
                          )
                      ]
                    : []),
                ...this.properties.map((p) => {
                    const swiftType = getSwiftTypeForTypeReference(p.valueType);
                    return swift.Statement.propertyAssignment(
                        p.name.name.camelCase.unsafeName,
                        swift.Expression.try(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("container"),
                                methodName: swiftType.isOptional ? "decodeIfPresent" : "decode",
                                arguments_: [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess({
                                            target: swift.Type.required(swiftType),
                                            memberName: "self"
                                        })
                                    }),
                                    swift.functionArgument({
                                        label: "forKey",
                                        value: swift.Expression.enumCaseShorthand(p.name.name.camelCase.unsafeName)
                                    })
                                ]
                            })
                        )
                    );
                }),
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesInfo.propertyName,
                    swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("decoder"),
                            methodName: "decodeAdditionalProperties",
                            arguments_: [
                                this.properties.length === 0
                                    ? swift.functionArgument({
                                          label: "knownKeys",
                                          value: swift.Expression.rawValue("[]")
                                      })
                                    : swift.functionArgument({
                                          label: "using",
                                          value: swift.Expression.rawValue("CodingKeys.self")
                                      })
                            ]
                        })
                    )
                )
            ])
        });
    }

    private generateEncodeMethod(): swift.Method {
        return swift.method({
            unsafeName: "encode",
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "to",
                    unsafeName: "encoder",
                    type: swift.Type.custom("Encoder")
                })
            ],
            throws: true,
            returnType: swift.Type.void(),
            body: swift.CodeBlock.withStatements([
                ...(this.properties.length > 0
                    ? [
                          swift.Statement.variableDeclaration(
                              "container",
                              swift.Expression.try(
                                  swift.Expression.methodCall({
                                      target: swift.Expression.reference("encoder"),
                                      methodName: "container",
                                      arguments_: [
                                          swift.functionArgument({
                                              label: "keyedBy",
                                              value: swift.Expression.rawValue("CodingKeys.self")
                                          })
                                      ]
                                  })
                              )
                          )
                      ]
                    : []),
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("encoder"),
                            methodName: "encodeAdditionalProperties",
                            arguments_: [
                                swift.functionArgument({
                                    value: swift.Expression.memberAccess({
                                        target: swift.Expression.rawValue("self"),
                                        memberName: this.additionalPropertiesInfo.propertyName
                                    })
                                })
                            ]
                        })
                    )
                ),
                ...this.properties.map((p) => {
                    const swiftType = getSwiftTypeForTypeReference(p.valueType);
                    return swift.Statement.expressionStatement(
                        swift.Expression.try(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("container"),
                                methodName: swiftType.isOptional ? "encodeIfPresent" : "encode",
                                arguments_: [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess({
                                            target: swift.Expression.rawValue("self"),
                                            memberName: p.name.name.camelCase.unsafeName
                                        })
                                    }),
                                    swift.functionArgument({
                                        label: "forKey",
                                        value: swift.Expression.enumCaseShorthand(p.name.name.camelCase.unsafeName)
                                    })
                                ]
                            })
                        )
                    );
                })
            ])
        });
    }

    private generateCodingKeysEnum(): swift.EnumWithRawValues | undefined {
        if (this.properties.length === 0) {
            return undefined;
        }
        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", swift.Protocol.CodingKey, swift.Protocol.CaseIterable],
            cases: this.properties.map((property) => {
                return {
                    unsafeName: property.name.name.camelCase.unsafeName,
                    rawValue: property.name.name.originalName
                };
            })
        });
    }

    private generateSwiftPropertyForProperty(property: ObjectProperty | InlinedRequestBodyProperty): swift.Property {
        return swift.property({
            unsafeName: property.name.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            declarationType: swift.DeclarationType.Let,
            type: getSwiftTypeForTypeReference(property.valueType)
        });
    }
}
