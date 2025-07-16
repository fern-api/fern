import { Type } from './Type'
import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace GoTypeReference {
    interface Args {
        /* The name of the Go type */
        name: string
        /* The import path of the Go type */
        importPath: string
        /* The generic type parameters, if any */
        generics?: Type[] | undefined
    }
}

export class GoTypeReference extends AstNode {
    public readonly name: string
    public readonly importPath: string
    public readonly generics: Type[] | undefined

    constructor({ name, importPath, generics }: GoTypeReference.Args) {
        super()
        this.name = name
        this.importPath = importPath
        this.generics = generics
    }

    public write(writer: Writer): void {
        if (writer.importPath === this.importPath) {
            writer.write(this.name)
            return
        }
        const alias = writer.addImport(this.importPath)
        writer.write(`${alias}.${this.name}`)
        if (this.generics != null) {
            writer.write('[')
            this.generics.forEach((generic, idx) => {
                if (idx > 0) {
                    writer.write(', ')
                }
                if (generic != null) {
                    generic.write(writer)
                }
            })
            writer.write(']')
        }
    }
}
