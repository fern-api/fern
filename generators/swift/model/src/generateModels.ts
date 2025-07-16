import { SwiftFile } from '@fern-api/swift-base'

import { ModelGeneratorContext } from './ModelGeneratorContext'
import { StringEnumGenerator } from './enum'
import { ObjectGenerator } from './object'

export function generateModels({ context }: { context: ModelGeneratorContext }): SwiftFile[] {
    const files: SwiftFile[] = []
    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<SwiftFile | undefined>({
            alias: () => undefined,
            enum: () => new StringEnumGenerator(typeDeclaration).generate(),
            object: () => new ObjectGenerator(typeDeclaration).generate(),
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
