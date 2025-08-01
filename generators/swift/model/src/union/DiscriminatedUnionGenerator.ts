import { assertNever, noop } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { ObjectProperty, TypeId, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { StructGenerator } from "../helpers";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class DiscriminatedUnionGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly unionTypeDeclaration: UnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        name: string,
        directory: RelativeFilePath,
        unionTypeDeclaration: UnionTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.name = name;
        this.directory = directory;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.context = context;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
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
                    rawName: singleUnionType.shape.name.wireValue,
                    type: swiftType
                });
            } else if (singleUnionType.shape.propertiesType === "samePropertiesAsObject") {
                const variantProperties = this.getPropertiesOfVariant(singleUnionType.shape.typeId);
                constantPropertyDefinitions.push({
                    unsafeName: this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName,
                    type: swift.Type.string(),
                    value: swift.Expression.rawStringValue(singleUnionType.discriminantValue.wireValue)
                });
                dataPropertyDefinitions.push(
                    ...variantProperties.map((p) => ({
                        unsafeName: p.name.name.camelCase.unsafeName,
                        rawName: p.name.wireValue,
                        type: getSwiftTypeForTypeReference(p.valueType)
                    }))
                );
            } else if (singleUnionType.shape.propertiesType === "noProperties") {
                noop();
            } else {
                assertNever(singleUnionType.shape);
            }

            return new StructGenerator({
                name: singleUnionType.discriminantValue.name.pascalCase.unsafeName,
                constantPropertyDefinitions,
                dataPropertyDefinitions,
                additionalProperties: true
            }).generate();
        });
    }

    private getPropertiesOfVariant(typeId: TypeId): ObjectProperty[] {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(typeId);
        return typeDeclaration.shape._visit({
            alias: () => [],
            enum: () => [],
            object: (otd) => otd.properties,
            union: () => [],
            undiscriminatedUnion: () => [],
            _other: () => []
        });
    }
}
