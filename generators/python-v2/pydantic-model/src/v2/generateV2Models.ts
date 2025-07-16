import { WriteablePythonFile } from "@fern-api/python-base"

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext"
import { EnumGenerator } from "./EnumGenerator"
import { ObjectGenerator } from "./ObjectGenerator"
import { WrappedAliasGenerator } from "./WrappedAliasGenerator"

export function generateV2Models({ context }: { context: PydanticModelGeneratorContext }): WriteablePythonFile[] {
    const files: WriteablePythonFile[] = []
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<WriteablePythonFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new WrappedAliasGenerator(typeId, context, typeDeclaration, aliasTypeDeclaration).doGenerate()
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeId, context, typeDeclaration, enumTypeDeclaration).doGenerate()
            },
            object: (objectTypDeclaration) => {
                return new ObjectGenerator(typeId, context, typeDeclaration, objectTypDeclaration).doGenerate()
            },
            undiscriminatedUnion: () => undefined,
            union: () => undefined,
            _other: () => undefined
        })
        if (file != null) {
            files.push(file)
        }
    }
    return files
}
