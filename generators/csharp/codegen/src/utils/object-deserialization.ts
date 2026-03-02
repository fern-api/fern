import { type Writer } from "../ast/core/Writer.js";

export interface ObjectDeserializationEntry {
    key: string;
    writeType: (writer: Writer) => void;
}

export interface ObjectDeserializationOptions {
    entries: ObjectDeserializationEntry[];
    onMatch: (writer: Writer) => void;
    exceptionType?: string;
    onCatch?: (writer: Writer) => void;
}

export function writeObjectDeserializationLoop(writer: Writer, options: ObjectDeserializationOptions): void {
    const { entries, onMatch, exceptionType = "JsonException", onCatch } = options;

    writer.writeTextStatement("var document = JsonDocument.ParseValue(ref reader)");
    writer.writeLine();
    writer.write("var types = new (string Key, System.Type Type)[] { ");
    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        writer.write(`("${entry.key}", typeof(`);
        entry.writeType(writer);
        writer.write("))");
        if (!isLast) {
            writer.write(", ");
        }
    });
    writer.writeTextStatement(" }");
    writer.writeLine();

    writer.writeLine("foreach (var (key, type) in types)");
    writer.pushScope();
    writer.writeLine("try");
    writer.pushScope();
    writer.writeTextStatement("var value = document.Deserialize(type, options)");
    writer.writeLine("if (value != null)");
    writer.pushScope();
    onMatch(writer);
    writer.popScope();
    writer.popScope();
    writer.writeLine(`catch (${exceptionType})`);
    writer.pushScope();
    if (onCatch) {
        onCatch(writer);
    }
    writer.popScope();
    writer.popScope();
}
