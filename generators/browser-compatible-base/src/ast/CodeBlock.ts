import { AbstractAstNode } from './AbstractAstNode'
import { AbstractWriter } from './AbstractWriter'

export declare namespace CodeBlock {
    /* Write arbitrary code */
    type Arg<T extends AbstractWriter> = string | AbstractAstNode | ((writer: T) => void)
}

export class CodeBlock<T extends AbstractWriter> extends AbstractAstNode {
    private value: CodeBlock.Arg<T>

    constructor(value: CodeBlock.Arg<T>) {
        super()
        this.value = value
    }

    public write(writer: T): void {
        if (typeof this.value === 'string') {
            writer.write(this.value)
            // if function
        } else if (typeof this.value === 'function') {
            this.value(writer)
        } else {
            this.value.write(writer)
        }
    }
}
