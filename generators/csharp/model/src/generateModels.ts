import { File } from "@fern-api/base-generator";
import { CSharpFile } from "@fern-api/csharp-base";

import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;

import { EnumGenerator } from "./enum/EnumGenerator.js";
import { StringEnumGenerator } from "./enum/StringEnumGenerator.js";
import { generateLiteralType, getLiteralStructName } from "./generateLiteralType.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UndiscriminatedUnionGenerator } from "./undiscriminated-union/UndiscriminatedUnionGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export interface GenerateModelsResult {
    files: CSharpFile[];
    literalTypeFiles: File[];
}

export function generateModels({ context }: { context: ModelGeneratorContext }): GenerateModelsResult {
    const files: CSharpFile[] = [];
    const literalTypeFiles: File[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: () => undefined,
            enum: (etd: EnumTypeDeclaration) => {
                return context.settings.isForwardCompatibleEnumsEnabled
                    ? new StringEnumGenerator(context, typeDeclaration, etd).generate()
                    : new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd) => {
                // Generate literal struct files for string literal properties when enableReadonlyConstants is on
                if (context.generation.settings.enableReadonlyConstants) {
                    const parentTypeName = typeDeclaration.name.name.pascalCase.safeName;
                    const namespace = context.getNamespaceForTypeId(typeId);
                    const directory = context.getDirectoryForTypeId(typeId);
                    for (const prop of [...otd.properties, ...(otd.extendedProperties ?? [])]) {
                        const literalValue = context.getLiteralValue(prop.valueType);
                        if (typeof literalValue === "string") {
                            const structName = getLiteralStructName({
                                parentTypeName,
                                propertyName: prop.name.name.pascalCase.safeName
                            });
                            literalTypeFiles.push(
                                generateLiteralType({
                                    structName,
                                    literalValue,
                                    namespace,
                                    directory
                                })
                            );
                        }
                    }
                }
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: (undiscriminatedUnionDeclaration) => {
                if (context.settings.shouldGenerateUndiscriminatedUnions) {
                    return new UndiscriminatedUnionGenerator(
                        context,
                        typeDeclaration,
                        undiscriminatedUnionDeclaration
                    ).generate();
                }
                return undefined;
            },
            union: (unionDeclaration) => {
                if (context.settings.shouldGeneratedDiscriminatedUnions) {
                    return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
                }
                return undefined;
            },
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return { files, literalTypeFiles };
}
