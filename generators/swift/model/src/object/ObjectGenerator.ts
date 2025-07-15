import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { ObjectProperty, Type } from "@fern-fern/ir-sdk/api";
import { PrimitiveTypeV1, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

function isOptionalProperty(p: ObjectProperty) {
    return p.valueType.type === "container" && p.valueType.container.type === "optional";
}

export class ObjectGenerator {
    private readonly typeDeclaration: TypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
    }

    public generate(): SwiftFile {
        const astNode = this.generateAstNodeForTypeDeclaration();
        const fileContents = astNode?.toString() ?? "";
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private getFilename(): string {
        // TODO: File names need to be unique across the generated output so we'll need to validate this
        return this.typeDeclaration.name.name.pascalCase.unsafeName + ".swift";
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(
            [...this.typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    private generateAstNodeForTypeDeclaration(): swift.Struct | null {
        switch (this.typeDeclaration.shape.type) {
            case "object": {
                const codingKeysEnum = this.generateCodingKeysEnum(this.typeDeclaration.shape);
                return swift.struct({
                    name: this.typeDeclaration.name.name.pascalCase.safeName,
                    accessLevel: swift.AccessLevel.Public,
                    conformances: ["Codable", "Hashable"],
                    properties: this.typeDeclaration.shape.properties.map((p) => this.generateAstNodeForProperty(p)),
                    initializers: [
                        this.generatePrimaryInitializer(this.typeDeclaration.shape),
                        this.generateInitializerForDecoder(this.typeDeclaration.shape)
                    ],
                    nestedTypes: codingKeysEnum ? [codingKeysEnum] : undefined
                });
            }
            case "alias":
            case "enum":
            case "undiscriminatedUnion":
            case "union":
                return null;
            default:
                assertNever(this.typeDeclaration.shape);
        }
    }

    private generatePrimaryInitializer(type: Type.Object_): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: type.properties.map((p) =>
                swift.functionParameter({
                    argumentLabel: p.name.name.camelCase.unsafeName,
                    unsafeName: p.name.name.camelCase.unsafeName,
                    type: this.generateAstNodeForTypeReference(p.valueType),
                    optional: isOptionalProperty(p),
                    defaultValue: isOptionalProperty(p) ? swift.Expression.rawValue("nil") : undefined
                })
            ),
            body: swift.CodeBlock.withStatements(
                type.properties.map((p) =>
                    swift.Statement.propertyAssignment(
                        p.name.name.camelCase.unsafeName,
                        swift.Expression.reference(p.name.name.camelCase.unsafeName)
                    )
                )
            )
        });
    }

    private generateInitializerForDecoder(type: Type.Object_): swift.Initializer {
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
                ...type.properties.map((p) =>
                    swift.Statement.propertyAssignment(
                        p.name.name.camelCase.unsafeName,
                        swift.Expression.try(
                            swift.Expression.methodCall(
                                swift.Expression.reference("container"),
                                isOptionalProperty(p) ? "decodeIfPresent" : "decode",
                                [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess(
                                            this.generateAstNodeForTypeReference(p.valueType),
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
                )
            ])
        });
    }

    private generateCodingKeysEnum(type: Type.Object_): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", "CodingKey"],
            cases: type.properties.map((property) => {
                return {
                    unsafeName: property.name.name.camelCase.unsafeName,
                    rawValue: property.name.name.originalName
                };
            })
        });
    }

    private generateAstNodeForProperty(property: ObjectProperty): swift.Property {
        return swift.property({
            unsafeName: property.name.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            declarationType: swift.DeclarationType.Let,
            type: this.generateAstNodeForTypeReference(property.valueType),
            optional: isOptionalProperty(property)
        });
    }

    private generateAstNodeForTypeReference(typeReference: TypeReference): swift.Type {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    // TODO: Handle these cases
                    literal: () => swift.Type.any(),
                    map: () => swift.Type.any(),
                    set: () => swift.Type.any(),
                    nullable: () => swift.Type.any(),
                    optional: (ref) => this.generateAstNodeForTypeReference(ref),
                    list: (ref) => swift.Type.array(this.generateAstNodeForTypeReference(ref)),
                    _other: () => swift.Type.any()
                });
            case "primitive":
                // TODO: Do we not look at typeReference.primitive.v2?
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => swift.Type.string(),
                    boolean: () => swift.Type.bool(),
                    integer: () => swift.Type.int(),
                    uint: () => swift.Type.uint(),
                    uint64: () => swift.Type.uint64(),
                    long: () => swift.Type.int64(),
                    float: () => swift.Type.float(),
                    double: () => swift.Type.double(),
                    // TODO: We may need to implement our own value type for this
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
