import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace ClassReference {
    interface Args {
        /** The name of the Ruby class (e.g., "Client") */
        name: string
        /** The module path as an array of strings (e.g., ["MyApi", "V1"]) */
        modules?: string[]
        /** Force the class reference to be fully qualified (with modules) */
        fullyQualified?: boolean
    }
}

export class ClassReference extends AstNode {
    public readonly name: string
    public readonly modules: string[]
    public readonly fullyQualified: boolean

    constructor({ name, modules, fullyQualified }: ClassReference.Args) {
        super()
        this.name = name
        this.modules = modules ?? []
        this.fullyQualified = fullyQualified ?? false
    }

    public write(writer: Writer): void {
        // If fullyQualified or modules are present, write the full module path
        if (this.fullyQualified || this.modules.length > 0) {
            const fullPath = [...this.modules, this.name].join('::')
            writer.write(fullPath)
            return
        }
        writer.write(this.name)
    }
}
