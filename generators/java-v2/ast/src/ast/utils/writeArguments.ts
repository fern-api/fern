import { Argument, Arguments, isNamedArgument } from "@fern-api/browser-compatible-base-generator";
import { Writer } from "../core/Writer";
import { TypeLiteral } from "../TypeLiteral";

export function writeArguments({ writer, arguments_ }: { writer: Writer; arguments_: Arguments }): void {
    const filteredArguments = filterNopArguments(arguments_);
    if (filteredArguments.length === 0) {
        writer.write("()");
        return;
    }
    const shouldWriteMultiline = filteredArguments.some((arg) => {
        return arg instanceof TypeLiteral && !arg.shouldWriteInLine();
    });
    if (shouldWriteMultiline) {
        writeMultilineArguments({ writer, arguments_: filteredArguments });
        return;
    }
    writer.write("(");
    filteredArguments.forEach((argument, index) => {
        if (index > 0) {
            writer.write(", ");
        }
        writeArgument({ writer, argument });
    });
    writer.write(")");
}

function writeMultilineArguments({ writer, arguments_ }: { writer: Writer; arguments_: Argument[] }): void {
    writer.writeLine("(");
    writer.indent();
    arguments_.forEach((argument, index) => {
        if (index > 0) {
            writer.writeLine(",");
        }
        writeArgument({ writer, argument });
    });
    writer.dedent();
    if (arguments_.length > 0) {
        writer.newLine();
    }
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
