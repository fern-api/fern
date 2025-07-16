import { Comment } from './Comment'
import { Module } from './Module'
import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace Class_ {
    export interface Args extends Module.Args {
        /* The superclass of this class. */
        superclass?: Class_
    }
}

export class Class_ extends Module {
    public readonly superclass: Class_ | undefined
    public readonly statements: AstNode[]

    constructor({ name, superclass, typeParameters, docstring, statements }: Class_.Args) {
        super({ name, docstring, typeParameters })

        this.superclass = superclass
        this.statements = statements ?? []
    }

    public write(writer: Writer): void {
        if (this.docstring) {
            new Comment({ docs: this.docstring }).write(writer)
        }

        writer.write(`class ${this.name}`)

        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`)
        }

        if (this.statements.length) {
            writer.newLine()
            writer.indent()

            this.statements.forEach((statement, index) => {
                statement.write(writer)
                if (index < this.statements.length - 1) {
                    writer.newLine()
                }
            })

            writer.dedent()
            writer.write('end')
        } else {
            writer.write('; end')
        }
        writer.newLine()
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`class ${this.name}`)

        if (this.typeParameters.length) {
            writer.write('[')

            writer.delimit({
                nodes: this.typeParameters,
                delimiter: ', ',
                writeFunction: (argument) => argument.writeTypeDefinition(writer)
            })

            writer.write(']')
        }

        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`)
        }

        writer.newLine()

        if (this.statements.length) {
            writer.indent()
            this.statements.forEach((statement) => {
                statement.writeTypeDefinition(writer)
                writer.newLine()
            })
            writer.dedent()
        }

        writer.write('end')
    }
}
