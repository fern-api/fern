import { assertDefined } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { TypeId, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object";

export class DiscriminatedUnionGenerator {
    private readonly name: string;
    private readonly unionTypeDeclaration: UnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(name: string, unionTypeDeclaration: UnionTypeDeclaration, context: ModelGeneratorContext) {
        this.name = name;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.context = context;
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Schemas");
    }

    private getFilename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents: [swiftEnum]
        });
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            cases: this.generateCasesForTypeDeclaration(),
            nestedTypes: this.generateNestedTypesForTypeDeclaration()
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return this.unionTypeDeclaration.types.map((singleUnionType) => {
            return {
                unsafeName: singleUnionType.discriminantValue.name.camelCase.unsafeName,
                associatedValue: [swift.Type.custom(singleUnionType.discriminantValue.name.pascalCase.unsafeName)]
            };
        });
    }

    private generateNestedTypesForTypeDeclaration(): swift.Struct[] {
        return this.unionTypeDeclaration.types.map((singleUnionType) => {
            const properties = singleUnionType.shape._visit({
                noProperties: () => [],
                singleProperty: (singleUnionTypeProperty) => [
                    swift.property({
                        unsafeName: singleUnionTypeProperty.name.name.camelCase.unsafeName,
                        accessLevel: swift.AccessLevel.Public,
                        declarationType: swift.DeclarationType.Let,
                        type: getSwiftTypeForTypeReference(singleUnionTypeProperty.type)
                    })
                ],
                samePropertiesAsObject: (declaredTypeName) => {
                    const struct = this.getStructForVariantType(declaredTypeName.typeId);
                    return [
                        swift.property({
                            unsafeName: this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName,
                            accessLevel: swift.AccessLevel.Public,
                            declarationType: swift.DeclarationType.Let,
                            type: swift.Type.string(),
                            defaultValue: swift.Expression.rawStringValue(singleUnionType.discriminantValue.wireValue)
                        }),
                        ...struct.properties
                    ];
                },
                _other: () => []
            });

            // TODO: Reuse between this method and ObjectGenerator
            return swift.struct({
                name: singleUnionType.discriminantValue.name.pascalCase.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
                properties,
                initializers: [
                    swift.initializer({
                        accessLevel: swift.AccessLevel.Public,
                        parameters: properties.map((p) =>
                            swift.functionParameter({
                                argumentLabel: p.unsafeName,
                                unsafeName: p.unsafeName,
                                type: p.type
                            })
                        ),
                        body: swift.CodeBlock.withStatements([])
                    })
                ],
                methods: [],
                nestedTypes: [
                    swift.enumWithRawValues({
                        name: "CodingKeys",
                        accessLevel: swift.AccessLevel.Private,
                        conformances: ["String", swift.Protocol.CodingKey],
                        cases: []
                    })
                ]
            });
        });
    }

    private getStructForVariantType(typeId: TypeId): swift.Struct {
        const typeDeclaration = this.context.getTypeById(typeId);
        assertDefined(typeDeclaration, `Type declaration not found for type id: ${typeId}`);
        const struct = typeDeclaration.shape._visit({
            alias: () => undefined,
            enum: () => undefined,
            object: (otd) =>
                new ObjectGenerator(
                    typeDeclaration.name.name.pascalCase.unsafeName,
                    "schema",
                    otd.properties,
                    otd.extendedProperties
                ).generateStructForTypeDeclaration(),
            union: () => undefined,
            undiscriminatedUnion: () => undefined,
            _other: () => undefined
        });
        assertDefined(struct, `Unexpected type declaration for union variant type: ${typeId}`);
        return struct;
    }
}
