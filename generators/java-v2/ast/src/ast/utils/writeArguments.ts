import { Argument, Arguments, isNamedArgument } from "@fern-api/browser-compatible-base-generator";

import { TypeLiteral } from "../TypeLiteral";
import { Writer } from "../core/Writer";

export function writeArguments({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    const filteredArguments = filterNopArguments(arguments_);
    if (filteredArguments.length === 0) {
        writer.write("()");
        return;
    }
    writer.writeLine("(");
    writer.indent();
    for (const argument of filteredArguments) {
        writeArgument({ writer, argument });
        writer.writeLine(",");
    }
    writer.dedent();
    writer.write(")");
}

function writeArgument({ writer, argument }: { writer: Writer; argument: Argument }): void {
    if (isNamedArgument(argument)) {
        writer.writeNodeOrString(argument.assignment);
    } else {
        argument.write(writer);
    }
}

function filterNopArguments(arguments_: Argument[]): Argument[] {
    return arguments_.filter((argument) => !(argument instanceof TypeLiteral && TypeLiteral.isNop(argument)));
}
