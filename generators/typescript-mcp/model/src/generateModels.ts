import { TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { AliasGenerator } from "./alias/AliasGenerator";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { UnionGenerator } from "./union/UnionGenerator";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const file = typeDeclaration.shape._visit<TypescriptMcpFile | undefined>({
            alias: (aliasDeclaration) => {
                return new AliasGenerator(context, typeDeclaration, aliasDeclaration).generate();
            },
            enum: (enumDeclaration) => {
                return new EnumGenerator(context, typeDeclaration, enumDeclaration).generate();
            },
            object: (objectDeclaration) => {
                return new ObjectGenerator(context, typeDeclaration, objectDeclaration).generate();
            },
            undiscriminatedUnion: () => undefined,
            union: (unionDeclaration) => {
                return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
            },
            _other: () => undefined
        });
        if (file != null) {
            context.project.addSchemasFile(file);
        }
    }
}
