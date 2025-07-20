import { RustFile } from "@fern-api/rust-base";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { StructGenerator } from "./object";
import { EnumGenerator } from "./enum";
import { AliasGenerator } from "./alias";

export function generateModels({ context }: { context: ModelGeneratorContext }): RustFile[] {
    const files: RustFile[] = [];
    
    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RustFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new AliasGenerator(typeDeclaration, aliasTypeDeclaration).generate();
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeDeclaration, enumTypeDeclaration).generate();
            },
            object: (objectTypeDeclaration) => {
                return new StructGenerator(typeDeclaration, objectTypeDeclaration).generate();
            },
            union: (unionTypeDeclaration) => {
                // TODO: Implement UnionGenerator for discriminated unions
                // For now, skip union types
                return undefined;
            },
            undiscriminatedUnion: (undiscriminatedUnionTypeDeclaration) => {
                // TODO: Implement UndiscriminatedUnionGenerator
                // For now, skip undiscriminated union types
                return undefined;
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