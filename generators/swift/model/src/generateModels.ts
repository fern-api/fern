import { SwiftFile } from "@fern-api/swift-base";

import { AliasGenerator } from "./alias";
import { StringEnumGenerator } from "./enum";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object";
import { DiscriminatedUnionGenerator, UndiscriminatedUnionGenerator } from "./union";

export function generateModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {
    const files: SwiftFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<SwiftFile | undefined>({
            alias: (atd) =>
                new AliasGenerator({
                    name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    directory: context.schemasDirectory,
                    typeDeclaration: atd,
                    context
                }).generate(),
            enum: (etd) =>
                new StringEnumGenerator({
                    name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    directory: context.schemasDirectory,
                    typeDeclaration,
                    enumTypeDeclaration: etd
                }).generate(),
            object: (otd) =>
                new ObjectGenerator({
                    name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    directory: context.schemasDirectory,
                    properties: otd.properties,
                    extendedProperties: otd.extendedProperties,
                    context
                }).generate(),
            undiscriminatedUnion: (uutd) =>
                new UndiscriminatedUnionGenerator({
                    name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    directory: context.schemasDirectory,
                    typeDeclaration: uutd,
                    context
                }).generate(),
            union: (utd) =>
                new DiscriminatedUnionGenerator({
                    name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    directory: context.schemasDirectory,
                    unionTypeDeclaration: utd,
                    context
                }).generate(),
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
