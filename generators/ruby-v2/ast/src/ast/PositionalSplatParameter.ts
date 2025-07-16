import { Parameter } from './Parameter'
import { Writer } from './core/Writer'

// TODO: Does this need to be narrowed to collection types only?
export declare namespace PositionalSplatParameter {
    interface Args extends Parameter.Args {}
}

export class PositionalSplatParameter extends Parameter {
    public write(writer: Writer): void {
        writer.write(`*${this.name}`)
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write('*')
        this.type.writeTypeDefinition(writer)
    }
}
