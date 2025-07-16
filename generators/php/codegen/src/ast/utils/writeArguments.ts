import { Argument, Arguments, isNamedArgument } from '@fern-api/browser-compatible-base-generator'

import { Writer } from '../core/Writer'

export function writeArguments({
    writer,
    arguments_,
    multiline
}: {
    writer: Writer
    arguments_: Arguments
    multiline?: boolean
}): void {
    if (arguments_.length === 0) {
        writer.write('()')
        return
    }
    if (multiline) {
        writeMultiline({ writer, arguments_ })
        return
    }
    writeCompact({ writer, arguments_ })
}

function writeMultiline({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    writer.writeLine('(')
    writer.indent()
    for (const argument of arguments_) {
        writeArgument({ writer, argument, writeCompact: false })
        writer.writeLine(',')
    }
    writer.dedent()
    writer.write(')')
}

function writeCompact({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    writer.write('(')
    arguments_.forEach((argument, index) => {
        if (index > 0) {
            writer.write(', ')
        }
        writeArgument({ writer, argument, writeCompact: true })
    })
    writer.write(')')
}

function writeArgument({
    writer,
    argument,
    writeCompact
}: {
    writer: Writer
    argument: Argument
    writeCompact: boolean
}): void {
    if (isNamedArgument(argument)) {
        if (argument.docs) {
            if (writeCompact) {
                writer.write(`/* ${argument.docs} */ `)
            } else {
                writer.writeLine(`/* ${argument.docs} */`)
            }
        }
        writer.write(`${argument.name}: `)
        writer.writeNodeOrString(argument.assignment)
    } else {
        argument.write(writer)
    }
}
