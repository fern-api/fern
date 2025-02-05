import { CodeBlockWriter, WriterFunction, WriterFunctionOrValue } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { getPropertyKey } from "../codegen-utils/getPropertyKey";

const NEWLINE_REGEX = /^/gm;

export declare namespace ObjectWriter {
    export interface Init {
        asConst?: boolean;
        newlinesBetweenProperties?: boolean;
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
    private newlinesBetweenProperties: boolean;

    static writer(init: ObjectWriter.Init = {}): ObjectWriter {
        return new ObjectWriter(init);
    }

    #isEmpty = true;
    public get isEmpty(): boolean {
        return this.#isEmpty;
    }

    private constructor({ asConst = false, newlinesBetweenProperties = false }: ObjectWriter.Init) {
        this.asConst = asConst;
        this.newlinesBetweenProperties = newlinesBetweenProperties;
    }

    public addProperty(property: Omit<ObjectWriter.Property, "type">): this {
        this.#isEmpty = false;
        this.blocks.push({
            ...property,
            type: "property"
        });
        return this;
    }

    public addProperties(properties: Record<string, ObjectWriter.Property["value"]>): this {
        for (const [key, value] of Object.entries(properties)) {
            this.blocks.push({
                key,
                value,
                type: "property"
            });
        }
        return this;
    }

    public addNewLine(): this {
        this.blocks.push({
            type: "custom",
            writer: (writer) => {
                writer.newLine();
            }
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
        };
    }

    private writeProperty(writer: CodeBlockWriter, property: ObjectWriter.Property) {
        if (property.docs != null) {
            writer.writeLine("/**");
            writer.write(property.docs.replaceAll(NEWLINE_REGEX, " * "));
            writer.newLineIfLastNot();
            writer.writeLine(" */");
        }

        writer.write(getPropertyKey(property.key));
        writer.write(": ");
        writeValue(writer, property.value);
        writer.write(",");
        writer.newLine();
        if (this.newlinesBetweenProperties) {
            writer.newLine();
        }
    }
}

function writeValue(writer: CodeBlockWriter, value: WriterFunctionOrValue) {
    if (typeof value === "string" || typeof value === "number") {
        writer.write(value.toString());
    } else {
        value(writer);
    }
}
