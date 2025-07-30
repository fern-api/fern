import { RustFile } from "@fern-api/rust-base";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { StructGenerator } from "./object";
import { EnumGenerator } from "./enum";
import { AliasGenerator } from "./alias";
import { UnionGenerator, UndiscriminatedUnionGenerator } from "./union";

export function generateModels({ context }: { context: ModelGeneratorContext }): RustFile[] {
    const files: RustFile[] = [];

    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RustFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new AliasGenerator(typeDeclaration, aliasTypeDeclaration, context).generate();
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeDeclaration, enumTypeDeclaration).generate();
            },
            object: (objectTypeDeclaration) => {
                return new StructGenerator(typeDeclaration, objectTypeDeclaration, context).generate();
            },
            union: (unionTypeDeclaration) => {
                return new UnionGenerator(typeDeclaration, unionTypeDeclaration, context).generate();
            },
            undiscriminatedUnion: (undiscriminatedUnionTypeDeclaration) => {
                return new UndiscriminatedUnionGenerator(
                    typeDeclaration,
                    undiscriminatedUnionTypeDeclaration,
                    context
                ).generate();
            },
            _other: () => {
                // Unknown type shape, skip for now
                return undefined;
            }
        });

        if (file != null) {
            files.push(file);
        }
    }

    return files;
}
