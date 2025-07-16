import { ModelGeneratorContext } from './ModelGeneratorContext'
import { AliasGenerator } from './alias/AliasGenerator'
import { EnumGenerator } from './enum/EnumGenerator'
import { IndexGenerator } from './index/IndexGenerator'
import { ObjectGenerator } from './object/ObjectGenerator'
import { UnionGenerator } from './union/UnionGenerator'

export function generateModels(context: ModelGeneratorContext): void {
    const typeDeclarations = Object.values(context.ir.types)
    for (const typeDeclaration of typeDeclarations) {
        let file
        switch (typeDeclaration.shape.type) {
            case 'alias':
                file = new AliasGenerator(context, typeDeclaration, typeDeclaration.shape).generate()
                break
            case 'enum':
                file = new EnumGenerator(context, typeDeclaration, typeDeclaration.shape).generate()
                break
            case 'object':
                file = new ObjectGenerator(context, typeDeclaration, typeDeclaration.shape).generate()
                break
            case 'undiscriminatedUnion':
                break
            case 'union':
                file = new UnionGenerator(context, typeDeclaration, typeDeclaration.shape).generate()
                break
            default:
                break
        }
        if (file != null) {
            context.project.addSchemasFile(file)
        }
    }
    const indexFile = new IndexGenerator(context, typeDeclarations).generate()
    context.project.addSchemasFile(indexFile)
}
