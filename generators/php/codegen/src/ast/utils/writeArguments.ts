import { Argument, Arguments, isNamedArgument } from "@fern-api/base-generator";

import { Writer } from "../core/Writer";

export function writeArguments({
    writer,
    arguments_,
    multiline
}: {
    writer: Writer;
    arguments_: Arguments;
    multiline?: boolean;
}): void {
    if (arguments_.length === 0) {
        writer.write("()");
        return;
    }
    if (multiline) {
        writeMultiline({ writer, arguments_ });
        return;
    }
    writeCompact({ writer, arguments_ });
}

function writeMultiline({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    writer.writeLine("(");
    writer.indent();
    for (const argument of arguments_) {
        writeArgument({ writer, argument });
        writer.writeLine(",");
    }
    writer.dedent();
    writer.write(")");
}

function writeCompact({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    writer.write("(");
    arguments_.forEach((argument, index) => {
        if (index > 0) {
            writer.write(", ");
        }
        writeArgument({ writer, argument });
    });
    writer.write(")");
}

function writeArgument({ writer, argument }: { writer: Writer; argument: Argument }): void {
    if (isNamedArgument(argument)) {
        writer.write(`${argument.name}: `);
        argument.assignment.write(writer);
    } else {
        argument.write(writer);
    }
}
