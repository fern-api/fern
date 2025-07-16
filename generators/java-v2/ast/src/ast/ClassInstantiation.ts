import { ClassReference } from './ClassReference'
import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'
import { writeArguments } from './utils/writeArguments'

export declare namespace ClassInstantiation {
    interface Args {
        /* The class to instantiate */
        classReference: ClassReference
        /* The arguments passed to the constructor */
        arguments_: AstNode[]
    }
}

export class ClassInstantiation extends AstNode {
    private classReference: ClassReference
    private arguments_: AstNode[]

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super()

        this.classReference = classReference
        this.arguments_ = arguments_
    }

    public write(writer: Writer): void {
        writer.writeNode(this.classReference)
        writeArguments({ writer, arguments_: this.arguments_ })
    }
}
