import { assertNever } from "@fern-api/core-utils";
import { AstNode, Writer } from "./core";
import { Type } from "./Type";

type InternalTypeLiteral = Array_ | Boolean_ | Number_ | Object_ | String_ | Tuple;

interface Array_ {
    type: "array";
    valueType: Type;
    values: TypeLiteral[];
}

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface Number_ {
    type: "number";
    value: number;
}

interface Object_ {
    type: "object";
    fields: ObjectField[];
}

interface ObjectField {
    name: string;
    valueType: Type;
    value: TypeLiteral;
}

interface String_ {
    type: "string";
    value: string;
}

interface Tuple {
    type: "tuple";
    // TODO: In theory this should be a tuple type, not an array of types
    valueTypes: Type[];
    values: TypeLiteral[];
}

interface IterableLiteral {
    values: TypeLiteral[];
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "array": {
                this.writeArray({ writer, array: this.internalType });
                break;
            }
            case "boolean": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "number": {
                // N.B. Defaults to decimal; further work needed to support alternatives like hex, binary, octal, etc.
                writer.write(this.internalType.value.toString());
                break;
            }
            case "object": {
                this.writeObject({ writer, object: this.internalType });
                break;
            }
            case "string": {
                if (this.internalType.value.includes("\n")) {
                    this.writeStringWithBackticks({ writer, value: this.internalType.value });
                } else {
                    writer.write(`"${this.internalType.value.replaceAll('"', '\\"')}"`);
                }
                break;
            }
            case "tuple": {
                this.writeTuple({ writer, tuple: this.internalType });
                break;
            }
            default: {
                assertNever(this.internalType);
            }
        }
    }

    private writeStringWithBackticks({ writer, value }: { writer: Writer; value: string }): void {
        writer.write("`");
        const parts = value.split("\n");
        const head = parts[0] + "\n";
        const tail = parts.slice(1).join("\n");
        writer.write(head.replaceAll("`", "\\`"));
        writer.writeNoIndent(tail.replaceAll("`", "\\`"));
        writer.write("`");
    }

    private writeArray({ writer, array }: { writer: Writer; array: Array_ }): void {
        this.writeIterable({
            writer,
            iterable: array,
            leftBrace: "[",
            rightBrace: "]",
            writeField: (value: TypeLiteral) => value.write(writer)
        });
    }

    private writeObject({ writer, object }: { writer: Writer; object: Object_ }): void {
        const values: TypeLiteral[] = [];
        const valuesToNames = new Map<TypeLiteral, string>();
        for (const field of object.fields) {
            values.push(field.value);
            valuesToNames.set(field.value, field.name);
        }
        const iterable = { values };
        this.writeIterable({
            writer,
            iterable,
            leftBrace: "{",
            rightBrace: "}",
            writeField: (value: TypeLiteral) => {
                const name = valuesToNames.get(value);
                if (name != null) {
                    writer.write(`${name}: `);
                    value.write(writer);
                } else {
                    throw Error(
                        `BUG: Could not find name for field value ${JSON.stringify(value)} in ${JSON.stringify(
                            object
                        )}.`
                    );
                }
            }
        });
    }

    private writeTuple({ writer, tuple }: { writer: Writer; tuple: Tuple }): void {
        this.writeIterable({
            writer,
            iterable: tuple,
            leftBrace: "[",
            rightBrace: "]",
            writeField: (value: TypeLiteral) => value.write(writer)
        });
    }

    private writeIterable({
        writer,
        iterable,
        leftBrace,
        rightBrace,
        writeField
    }: {
        writer: Writer;
        iterable: IterableLiteral;
        leftBrace: string;
        rightBrace: string;
        writeField: (value: TypeLiteral) => void;
    }): void {
        if (iterable.values.length === 0) {
            // Don't allow "multiline" empty collections.
            writer.write(`${leftBrace}${rightBrace}`);
        } else {
            writer.writeLine(`${leftBrace}`);
            writer.indent();
            for (const value of iterable.values) {
                writeField(value);
                writer.writeLine(",");
            }
            writer.dedent();
            writer.write(`${rightBrace}`);
        }
    }

    /* Static factory methods for creating a TypeLiteral */
    public static array({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "array",
            valueType,
            values
        });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value });
    }

    public static number(value: number): TypeLiteral {
        return new this({ type: "number", value });
    }

    public static object(fields: ObjectField[]): TypeLiteral {
        return new this({
            type: "object",
            fields
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static tuple({ valueTypes, values }: { valueTypes: Type[]; values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "tuple",
            valueTypes,
            values
        });
    }
}
