import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace TypeParameter {
    export interface Args {
        /* The name of the type parameter */
        name: string
    }
}

/* A C# generic type parameter */
export class TypeParameter extends AstNode {
    private name: string
    public constructor({ name }: TypeParameter.Args) {
        super()
        this.name = name
    }

    public write(writer: Writer): void {
        writer.write(this.name)
    }
}
