import { PhpFile } from "@fern-api/php-base"

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api"

import { ModelGeneratorContext } from "./ModelGeneratorContext"
import { EnumGenerator } from "./enum/EnumGenerator"
import { ObjectGenerator } from "./object/ObjectGenerator"
import { UnionGenerator } from "./union/UnionGenerator"

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const file = typeDeclaration.shape._visit<PhpFile | undefined>({
            alias: () => undefined,
            enum: (enumDeclaration: EnumTypeDeclaration) => {
                return new EnumGenerator(context, typeDeclaration, enumDeclaration).generate()
            },
            object: (objectDeclaration) => {
                return new ObjectGenerator(context, typeDeclaration, objectDeclaration).generate()
            },
            undiscriminatedUnion: () => undefined,
            union: (unionTypeDeclaration) => {
                return new UnionGenerator(context, typeDeclaration, unionTypeDeclaration).generate()
            },
            _other: () => undefined
        })
        if (file != null) {
            context.project.addSourceFiles(file)
        }
    }
}
