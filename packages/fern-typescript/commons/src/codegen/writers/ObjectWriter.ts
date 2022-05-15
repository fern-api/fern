import { assertNever } from "@fern-api/commons";
import esutils from "esutils";
import { CodeBlockWriter, WriterFunction, WriterFunctionOrValue } from "ts-morph";

export declare namespace ObjectWriter {
    export interface Init {
        asConst?: boolean;
    }

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
    private asConst: boolean;

    static writer(init: ObjectWriter.Init = {}): ObjectWriter {
        return new ObjectWriter(init);
    }

    private constructor({ asConst = false }: ObjectWriter.Init) {
        this.asConst = asConst;
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
            if (this.asConst) {
                writer.write(" as const");
            }
            writer.write(";");
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
