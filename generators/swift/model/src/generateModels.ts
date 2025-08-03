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
                new AliasGenerator(
                    context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    context.schemasDirectory,
                    atd
                ).generate(),
            enum: (etd) =>
                new StringEnumGenerator(
                    context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    context.schemasDirectory,
                    typeDeclaration,
                    etd
                ).generate(),
            object: (otd) =>
                new ObjectGenerator(
                    context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    context.schemasDirectory,
                    otd.properties,
                    otd.extendedProperties
                ).generate(),
            undiscriminatedUnion: (uutd) =>
                new UndiscriminatedUnionGenerator(
                    context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    context.schemasDirectory,
                    uutd
                ).generate(),
            union: (utd) =>
                new DiscriminatedUnionGenerator(
                    context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                    context.schemasDirectory,
                    utd,
                    context
                ).generate(),
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
