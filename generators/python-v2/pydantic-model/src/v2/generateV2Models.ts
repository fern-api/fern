import { WriteablePythonFile } from "@fern-api/python-base";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext.js";
import { EnumGenerator } from "./EnumGenerator.js";
import { ObjectGenerator } from "./ObjectGenerator.js";
import { WrappedAliasGenerator } from "./WrappedAliasGenerator.js";

export function generateV2Models({ context }: { context: PydanticModelGeneratorContext }): WriteablePythonFile[] {
    const files: WriteablePythonFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<WriteablePythonFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new WrappedAliasGenerator(typeId, context, typeDeclaration, aliasTypeDeclaration).doGenerate();
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeId, context, typeDeclaration, enumTypeDeclaration).doGenerate();
            },
            object: (objectTypDeclaration) => {
                return new ObjectGenerator(typeId, context, typeDeclaration, objectTypDeclaration).doGenerate();
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
