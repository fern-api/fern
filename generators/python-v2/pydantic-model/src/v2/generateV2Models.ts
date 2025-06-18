import { WriteablePythonFile } from "@fern-api/python-base";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "./ObjectGenerator";
import { UndiscriminatedUnionGenerator } from "./UndiscriminatedUnionGenerator";
import { WrappedAliasGenerator } from "./WrappedAliasGenerator";

export function generateV2Models({ context }: { context: PydanticModelGeneratorContext }): WriteablePythonFile[] {
    const files: WriteablePythonFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<WriteablePythonFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new WrappedAliasGenerator(typeId, context, typeDeclaration, aliasTypeDeclaration).doGenerate();
            },
            enum: () => undefined,
            object: (objectTypDeclaration) => {
                return new ObjectGenerator(typeId, context, typeDeclaration, objectTypDeclaration).doGenerate();
            },
            undiscriminatedUnion: (UndiscriminatedUnionTypeDeclaration) => {
                return new UndiscriminatedUnionGenerator(
                    typeId,
                    context,
                    typeDeclaration,
                    UndiscriminatedUnionTypeDeclaration
                ).doGenerate();
            },
            union: () => undefined,
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
