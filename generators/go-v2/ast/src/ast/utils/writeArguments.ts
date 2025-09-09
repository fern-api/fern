import { UnnamedArgument } from "@fern-api/browser-compatible-base-generator";
import { Writer } from "../core/Writer";
import { TypeInstantiation } from "../TypeInstantiation";

export function writeArguments({
    writer,
    arguments_,
    multiline = true
}: {
    writer: Writer;
    arguments_: UnnamedArgument[];
    multiline?: boolean;
}): void {
    const modifiedArguments = arguments_.map((argument) => {
        // A nop argument (optional type reference) cannot be ommitted (like in a struct literal type instantation with omitempty)
        // but must be replaced with nil
        if (argument instanceof TypeInstantiation && TypeInstantiation.isNop(argument)) {
            return TypeInstantiation.nil();
        }
        return argument;
    });
    if (modifiedArguments.length === 0) {
        writer.write("()");
        return;
    }
    if (multiline) {
        writeMultiline({ writer, arguments_: modifiedArguments });
        return;
    }
    writeCompact({ writer, arguments_: modifiedArguments });
}

function writeMultiline({ writer, arguments_ }: { writer: Writer; arguments_: UnnamedArgument[] }): void {
    writer.writeLine("(");
    writer.indent();
    for (const argument of arguments_) {
        argument.write(writer);
        writer.writeLine(",");
    }
    writer.dedent();
    writer.write(")");
}

function writeCompact({ writer, arguments_ }: { writer: Writer; arguments_: UnnamedArgument[] }): void {
    writer.write("(");
    arguments_.forEach((argument, index) => {
        if (index > 0) {
            writer.write(", ");
        }
        argument.write(writer);
    });
    writer.write(")");
}
