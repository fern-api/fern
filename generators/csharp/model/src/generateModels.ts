import { CSharpFile } from "@fern-api/csharp-base";

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { EnumGenerator } from "./enum/EnumGenerator";
import { StringEnumGenerator } from "./enum/StringEnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { UnionGenerator } from "./union/UnionGenerator";

export function generateModels({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
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
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: () => undefined,
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
    return files;
}
