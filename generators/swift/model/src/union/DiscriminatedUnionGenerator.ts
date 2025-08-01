import { assertDefined } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { TypeId, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object";
import { StructGenerator } from "../helpers";

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
            const constantPropertyDefinitions: StructGenerator.ConstantPropertyDefinition[] = [];
            const dataPropertyDefinitions: StructGenerator.DataPropertyDefinition[] = [];

            if (singleUnionType.shape.propertiesType === "singleProperty") {
                const swiftType = getSwiftTypeForTypeReference(singleUnionType.shape.type);
                constantPropertyDefinitions.push({
                    unsafeName: this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName,
                    type: swift.Type.string(),
                    value: swift.Expression.rawStringValue(singleUnionType.discriminantValue.wireValue)
                });
                dataPropertyDefinitions.push({
                    unsafeName: singleUnionType.shape.name.name.camelCase.unsafeName,
                    nameWireValue: singleUnionType.shape.name.wireValue,
                    type: swiftType
                });
            } else if (singleUnionType.shape.propertiesType === "samePropertiesAsObject") {
                const struct = this.getStructForVariantType(singleUnionType.shape.typeId);
                constantPropertyDefinitions.push({
                    unsafeName: this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName,
                    type: swift.Type.string(),
                    value: swift.Expression.rawStringValue(singleUnionType.discriminantValue.wireValue)
                });
                dataPropertyDefinitions.push(
                    ...struct.properties.map((p) => ({
                        unsafeName: p.unsafeName,
                        nameWireValue: "placeholder", // TODO: Implement
                        type: p.type
                    }))
                );
            }

            return new StructGenerator({
                name: singleUnionType.discriminantValue.name.pascalCase.unsafeName,
                constantPropertyDefinitions,
                dataPropertyDefinitions,
                additionalProperties: true
            }).generate();
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
