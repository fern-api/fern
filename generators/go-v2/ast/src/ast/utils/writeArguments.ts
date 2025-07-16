import { UnnamedArgument } from "@fern-api/browser-compatible-base-generator"

import { TypeInstantiation } from "../TypeInstantiation"
import { Writer } from "../core/Writer"

export function writeArguments({
    writer,
    arguments_,
    multiline = true
}: {
    writer: Writer
    arguments_: UnnamedArgument[]
    multiline?: boolean
}): void {
    const filteredArguments = filterNopArguments(arguments_)
    if (filteredArguments.length === 0) {
        writer.write("()")
        return
    }
    if (multiline) {
        writeMultiline({ writer, arguments_: filteredArguments })
        return
    }
    writeCompact({ writer, arguments_: filteredArguments })
}

function writeMultiline({ writer, arguments_ }: { writer: Writer; arguments_: UnnamedArgument[] }): void {
    writer.writeLine("(")
    writer.indent()
    for (const argument of arguments_) {
        argument.write(writer)
        writer.writeLine(",")
    }
    writer.dedent()
    writer.write(")")
}

function writeCompact({ writer, arguments_ }: { writer: Writer; arguments_: UnnamedArgument[] }): void {
    writer.write("(")
    arguments_.forEach((argument, index) => {
        if (index > 0) {
            writer.write(", ")
        }
        argument.write(writer)
    })
    writer.write(")")
}

function filterNopArguments(arguments_: UnnamedArgument[]): UnnamedArgument[] {
    return arguments_.filter(
        (argument) => !(argument instanceof TypeInstantiation && TypeInstantiation.isNop(argument))
    )
}
