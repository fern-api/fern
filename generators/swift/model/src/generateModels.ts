import { SwiftFile } from "@fern-api/swift-base";

import { StringEnumGenerator } from "./enum";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object";
import { DiscriminatedUnionGenerator } from "./union";

export function generateModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {
    const files: SwiftFile[] = [];
    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<SwiftFile | undefined>({
            alias: () => undefined,
            enum: (etd) =>
                new StringEnumGenerator(
                    typeDeclaration.name.name.pascalCase.unsafeName,
                    context.schemasDirectory,
                    typeDeclaration,
                    etd
                ).generate(),
            object: (otd) =>
                new ObjectGenerator(
                    typeDeclaration.name.name.pascalCase.unsafeName,
                    context.schemasDirectory,
                    otd.properties,
                    otd.extendedProperties
                ).generate(),
            undiscriminatedUnion: () => undefined,
            union: (utd) =>
                new DiscriminatedUnionGenerator(
                    typeDeclaration.name.name.pascalCase.unsafeName,
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
