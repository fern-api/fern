import { RustFile } from "@fern-api/rust-base";
import { AliasGenerator } from "./alias";
import { EnumGenerator } from "./enum";
import { InlinedRequestBodyGenerator } from "./inlined-request-body";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { StructGenerator } from "./object";
import { QueryParameterRequestGenerator } from "./query-request";
import { UndiscriminatedUnionGenerator, UnionGenerator } from "./union";

export function generateModels({ context }: { context: ModelGeneratorContext }): RustFile[] {
    const files: RustFile[] = [];

    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RustFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new AliasGenerator(typeDeclaration, aliasTypeDeclaration, context).generate();
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeDeclaration, enumTypeDeclaration, context).generate();
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

    // Generate inlined request body types from services
    const inlinedRequestBodyGenerator = new InlinedRequestBodyGenerator(context.ir, context);
    files.push(...inlinedRequestBodyGenerator.generateFiles());

    // NEW: Generate query parameter request structs for query-only endpoints
    const queryRequestGenerator = new QueryParameterRequestGenerator(context.ir, context);
    files.push(...queryRequestGenerator.generateFiles());

    return files;
}
