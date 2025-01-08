import { CSharpFile } from "@fern-api/csharp-codegen";

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { EnumGenerator } from "./enum/EnumGenerator";
import { StringEnumGenerator } from "./enum/StringEnumGenerator";
import { ObjectGenerator } from "./object/ObjectGenerator";

export function generateModels({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isAnyWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: () => undefined,
            enum: (etd: EnumTypeDeclaration) => {
                return (context.customConfig["experimental-enable-forward-compatible-enums"] ?? false)
                    ? new StringEnumGenerator(context, typeDeclaration, etd).generate()
                    : new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd) => {
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: () => undefined,
            union: () => undefined,
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
