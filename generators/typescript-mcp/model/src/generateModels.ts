import { TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const file = typeDeclaration.shape._visit<TypescriptMcpFile | undefined>({
            alias: () => undefined,
            enum: () => undefined,
            object: (objectDeclaration) => {
                return new ObjectGenerator(context, typeDeclaration, objectDeclaration).generate();
            },
            undiscriminatedUnion: () => undefined,
            union: () => undefined,
            _other: () => undefined
        });
        if (file != null) {
            context.project.addTypescriptMcpFiles(file);
        }
    }
}
