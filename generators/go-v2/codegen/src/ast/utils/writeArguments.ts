import { Argument, Arguments, isNamedArgument } from "@fern-api/generator-commons";
import { Writer } from "../core/Writer";

export function writeArguments({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    if (arguments_.length === 0) {
        writer.write("()");
        return;
    }
    writer.writeLine("(");
    writer.indent();
    for (const argument of arguments_) {
        writeArgument({ writer, argument });
        writer.writeLine(",");
    }
    writer.dedent();
    writer.write(")");
}

function writeArgument({ writer, argument }: { writer: Writer; argument: Argument }): void {
    if (isNamedArgument(argument)) {
        argument.assignment.write(writer);
    } else {
        argument.write(writer);
    }
}
