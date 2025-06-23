import {
    Argument,
    Arguments,
    NamedArgument,
    UnnamedArgument,
    isNamedArgument
} from "@fern-api/browser-compatible-base-generator";

import { TypeInstantiation } from "../TypeInstantiation";
import { Writer } from "../core/Writer";

export function writeArguments({
    writer,
    arguments_,
    multiline = true
}: {
    writer: Writer;
    arguments_: Arguments;
    multiline?: boolean;
}): void {
    const filteredArguments = filterNopArguments(arguments_);

    if (filteredArguments.length === 0) {
        writer.write("()");
        return;
    }
    if (multiline) {
        writeMultiline({ writer, arguments_: filteredArguments });
        return;
    }
    writeCompact({ writer, arguments_: filteredArguments });
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
        writer.writeNodeOrString(argument.assignment);
    } else {
        argument.write(writer);
    }
}

function filterNopArguments(arguments_: Arguments): Arguments {
    const filtered = arguments_.filter(
        (argument) => !(argument instanceof TypeInstantiation && TypeInstantiation.isNop(argument))
    );
    if (arguments_.length > 0 && arguments_[0] != null && "name" in arguments_[0]) {
        return filtered as NamedArgument[];
    }
    return filtered as UnnamedArgument[];
}
