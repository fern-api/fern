import esutils from "esutils";
import { CodeBlockWriter, WriterFunction, WriterFunctionOrValue } from "ts-morph";
import { assertNever } from "../../assertNever";

export declare namespace ObjectWriter {
    export type Block = Property | CustomWrite;

    export interface Property {
        type: "property";
        key: string;
        value: string | WriterFunction;
        docs?: string;
    }

    export interface CustomWrite {
        type: "custom";
        writer: WriterFunction;
    }
}

export class ObjectWriter {
    private blocks: ObjectWriter.Block[] = [];

    static writer(): ObjectWriter {
        return new ObjectWriter();
    }

    private constructor() {
        /* private */
    }

    public addProperty(property: Omit<ObjectWriter.Property, "type">): this {
        this.blocks.push({
            ...property,
            type: "property",
        });
        return this;
    }

    public addNewLine(): this {
        this.blocks.push({
            type: "custom",
            writer: (writer) => {
                writer.newLine();
            },
        });
        return this;
    }

    public toFunction(): WriterFunction {
        return (writer) => {
            writer.write("{");
            if (this.blocks.length > 0) {
                writer.indent(() => {
                    for (const block of this.blocks) {
                        switch (block.type) {
                            case "property":
                                this.writeProperty(writer, block);
                                break;
                            case "custom":
                                block.writer(writer);
                                break;
                            default:
                                assertNever(block);
                        }
                    }
                });
            }
            writer.write("}");
        };
    }

    private writeProperty(writer: CodeBlockWriter, property: ObjectWriter.Property) {
        if (esutils.keyword.isIdentifierNameES6(property.key)) {
            writer.write(property.key);
        } else {
            writer.write(`"${property.key}"`);
        }
        writer.write(": ");
        writeValue(writer, property.value);
        writer.write(",");
        writer.newLine();
    }
}

function writeValue(writer: CodeBlockWriter, value: WriterFunctionOrValue) {
    if (typeof value === "string" || typeof value === "number") {
        writer.write(value.toString());
    } else {
        value(writer);
    }
}
