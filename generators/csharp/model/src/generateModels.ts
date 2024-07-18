import { CSharpFile } from "@fern-api/csharp-codegen";
import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";

export function generateModels({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
    for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: () => undefined,
            enum: (etd: EnumTypeDeclaration) => {
                return new EnumGenerator(context, typeDeclaration, etd).generate();
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
