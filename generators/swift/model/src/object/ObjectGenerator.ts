import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { ObjectProperty, ObjectTypeDeclaration, Type } from "@fern-fern/ir-sdk/api";
import { PrimitiveTypeV1, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

function isOptionalProperty(p: ObjectProperty) {
    return p.valueType.type === "container" && p.valueType.container.type === "optional";
}

export class ObjectGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly objectTypeDeclaration: ObjectTypeDeclaration;
    private readonly additionalPropertiesInfo;

    public constructor(typeDeclaration: TypeDeclaration, objectTypeDeclaration: ObjectTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.additionalPropertiesInfo = this.getAdditionalPropertiesInfo(objectTypeDeclaration);
    }

    private getAdditionalPropertiesInfo(otd: ObjectTypeDeclaration) {
        const propertyNames = new Set(otd.properties.map((p) => p.name.name.camelCase.unsafeName));
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

    private getFilename(): string {
        // TODO(kafkas): File names need to be unique across the generated output so we'll need to validate this
        return this.typeDeclaration.name.name.pascalCase.unsafeName + ".swift";
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(
            [...this.typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    private generateStructForTypeDeclaration(): swift.Struct {
        const codingKeysEnum = this.generateCodingKeysEnum();
        return swift.struct({
            name: this.typeDeclaration.name.name.pascalCase.safeName,
            accessLevel: swift.AccessLevel.Public,
            conformances: ["Codable", "Hashable"],
            properties: [
                ...this.objectTypeDeclaration.properties.map((p) => this.generateSwiftPropertyForProperty(p)),
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
                ...this.objectTypeDeclaration.properties.map((p) =>
                    swift.functionParameter({
                        argumentLabel: p.name.name.camelCase.unsafeName,
                        unsafeName: p.name.name.camelCase.unsafeName,
                        type: this.generateSwiftTypeForTypeReference(p.valueType),
                        optional: isOptionalProperty(p),
                        defaultValue: isOptionalProperty(p) ? swift.Expression.rawValue("nil") : undefined
                    })
                ),
                swift.functionParameter({
                    argumentLabel: this.additionalPropertiesInfo.propertyName,
                    unsafeName: this.additionalPropertiesInfo.propertyName,
                    type: this.additionalPropertiesInfo.swiftType,
                    defaultValue: swift.Expression.contextualMethodCall("init")
                })
            ],
            body: swift.CodeBlock.withStatements([
                ...this.objectTypeDeclaration.properties.map((p) =>
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
                swift.Statement.constantDeclaration(
                    "container",
                    swift.Expression.try(
                        swift.Expression.methodCall(swift.Expression.reference("decoder"), "container", [
                            swift.functionArgument({
                                label: "keyedBy",
                                value: swift.Expression.rawValue("CodingKeys.self")
                            })
                        ])
                    )
                ),
                ...this.objectTypeDeclaration.properties.map((p) =>
                    swift.Statement.propertyAssignment(
                        p.name.name.camelCase.unsafeName,
                        swift.Expression.try(
                            swift.Expression.methodCall(
                                swift.Expression.reference("container"),
                                isOptionalProperty(p) ? "decodeIfPresent" : "decode",
                                [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess(
                                            this.generateSwiftTypeForTypeReference(p.valueType),
                                            "self"
                                        )
                                    }),
                                    swift.functionArgument({
                                        label: "forKey",
                                        value: swift.Expression.enumCaseShorthand(p.name.name.camelCase.unsafeName)
                                    })
                                ]
                            )
                        )
                    )
                ),
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesInfo.propertyName,
                    swift.Expression.try(
                        swift.Expression.methodCall(
                            swift.Expression.reference("decoder"),
                            "decodeAdditionalProperties",
                            [
                                swift.functionArgument({
                                    label: "using",
                                    value: swift.Expression.rawValue("CodingKeys.self")
                                })
                            ]
                        )
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
            returnType: swift.Type.custom("Void"),
            body: swift.CodeBlock.withStatements([
                swift.Statement.variableDeclaration(
                    "container",
                    swift.Expression.try(
                        swift.Expression.methodCall(swift.Expression.reference("encoder"), "container", [
                            swift.functionArgument({
                                label: "keyedBy",
                                value: swift.Expression.rawValue("CodingKeys.self")
                            })
                        ])
                    )
                ),
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.methodCall(
                            swift.Expression.reference("encoder"),
                            "encodeAdditionalProperties",
                            [
                                swift.functionArgument({
                                    value: swift.Expression.memberAccess(
                                        swift.Expression.rawValue("self"),
                                        this.additionalPropertiesInfo.propertyName
                                    )
                                })
                            ]
                        )
                    )
                ),
                ...this.objectTypeDeclaration.properties.map((p) =>
                    swift.Statement.expressionStatement(
                        swift.Expression.try(
                            swift.Expression.methodCall(
                                swift.Expression.reference("container"),
                                isOptionalProperty(p) ? "encodeIfPresent" : "encode",
                                [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess(
                                            swift.Expression.rawValue("self"),
                                            p.name.name.camelCase.unsafeName
                                        )
                                    }),
                                    swift.functionArgument({
                                        label: "forKey",
                                        value: swift.Expression.enumCaseShorthand(p.name.name.camelCase.unsafeName)
                                    })
                                ]
                            )
                        )
                    )
                )
            ])
        });
    }

    private generateCodingKeysEnum(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", "CodingKey", "CaseIterable"],
            cases: this.objectTypeDeclaration.properties.map((property) => {
                return {
                    unsafeName: property.name.name.camelCase.unsafeName,
                    rawValue: property.name.name.originalName
                };
            })
        });
    }

    private generateSwiftPropertyForProperty(property: ObjectProperty): swift.Property {
        return swift.property({
            unsafeName: property.name.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            declarationType: swift.DeclarationType.Let,
            type: this.generateSwiftTypeForTypeReference(property.valueType),
            optional: isOptionalProperty(property)
        });
    }

    private generateSwiftTypeForTypeReference(typeReference: TypeReference): swift.Type {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    // TODO(kafkas): Handle these cases
                    literal: () => swift.Type.any(),
                    map: () => swift.Type.any(),
                    set: () => swift.Type.any(),
                    nullable: () => swift.Type.any(),
                    optional: (ref) => this.generateSwiftTypeForTypeReference(ref),
                    list: (ref) => swift.Type.array(this.generateSwiftTypeForTypeReference(ref)),
                    _other: () => swift.Type.any()
                });
            case "primitive":
                // TODO(kafkas): Do we not look at typeReference.primitive.v2?
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => swift.Type.string(),
                    boolean: () => swift.Type.bool(),
                    integer: () => swift.Type.int(),
                    uint: () => swift.Type.uint(),
                    uint64: () => swift.Type.uint64(),
                    long: () => swift.Type.int64(),
                    float: () => swift.Type.float(),
                    double: () => swift.Type.double(),
                    // TODO(kafkas): We may need to implement our own value type for this
                    bigInteger: () => swift.Type.string(),
                    date: () => swift.Type.date(),
                    dateTime: () => swift.Type.date(),
                    base64: () => swift.Type.string(),
                    uuid: () => swift.Type.uuid(),
                    _other: () => swift.Type.any()
                });
            case "named":
                return swift.Type.custom(typeReference.name.pascalCase.unsafeName);
            case "unknown":
                return swift.Type.any();
            default:
                assertNever(typeReference);
        }
    }
}
