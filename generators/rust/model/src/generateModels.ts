import { RustFile } from "@fern-api/rust-base";
import { AliasGenerator } from "./alias";
import { EnumGenerator } from "./enum";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { StructGenerator } from "./object";
import { SymbolRegistry } from "./SymbolRegistry";
import { UndiscriminatedUnionGenerator, UnionGenerator } from "./union";

export function generateModels({ context }: { context: ModelGeneratorContext }): RustFile[] {
    const files: RustFile[] = [];

    // Use symbol registry for sophisticated collision handling
    const symbolRegistry = new SymbolRegistry();
    const skipDuplicateTypes = context.customConfig.skipDuplicateTypes ?? true;
    symbolRegistry.registerSymbols(context.ir.types, skipDuplicateTypes);

    // Process symbols in deterministic order
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types).sort(([a], [b]) => a.localeCompare(b))) {
        const resolvedName = symbolRegistry.getResolvedName(typeId);

        // Skip if symbol registry determined it should be skipped
        if (!resolvedName) {
            const originalName = typeDeclaration.name.name.snakeCase.unsafeName;
            console.warn(`Skipping duplicate type name: ${originalName}`);
            continue;
        }

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
