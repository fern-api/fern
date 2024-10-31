import { assertNever } from "@fern-api/core-utils";
import { AstNode, Writer } from "./core";
import { Type } from "./Type";

type InternalTypeLiteral = Array_ | Boolean_ | Number_ | Object_ | String_ | Tuple;

interface Array_ {
    type: "array";
    valueType: Type;
    fields: ArrayField[];
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

interface String_ {
    type: "string";
    value: string;
}

interface Tuple {
    type: "tuple";
    fields: TupleField[];
}

interface IterableLiteral<T extends IterableLiteralField> {
    fields: T[];
}

type IterableLiteralField = ArrayField | ObjectField | TupleField;

interface ArrayField {
    type: "arrayField";
    value: TypeLiteral;
}

interface ObjectField {
    type: "objectField";
    name: string;
    valueType: Type;
    value: TypeLiteral;
}

interface TupleField {
    type: "tupleField";
    valueType: Type;
    value: TypeLiteral;
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "array": {
                this.writeArray({ writer, value: this.internalType });
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
                this.writeObject({ writer, value: this.internalType });
                break;
            }
            case "string": {
                if (this.internalType.value.includes("\n")) {
                    writer.write("`");
                    const parts = this.internalType.value.split("\n");
                    const head = parts[0] + "\n";
                    const tail = parts.slice(1).join("\n");
                    writer.write(head.replaceAll("`", "\\`"));
                    writer.writeNoIndent(tail.replaceAll("`", "\\`"));
                    writer.write("`");
                } else {
                    writer.write(`"${this.internalType.value.replaceAll('"', '\\"')}"`);
                }
                break;
            }
            case "tuple": {
                this.writeTuple({ writer, value: this.internalType });
                break;
            }
            default: {
                assertNever(this.internalType);
            }
        }
    }

    private writeArray({ writer, value }: { writer: Writer; value: Array_ }) {
        this.writeIterable({
            writer,
            value,
            leftBrace: "[",
            rightBrace: "]"
        });
    }

    private writeObject({ writer, value }: { writer: Writer; value: Object_ }) {
        this.writeIterable({
            writer,
            value,
            leftBrace: "{",
            rightBrace: "}"
        });
    }

    private writeTuple({ writer, value }: { writer: Writer; value: Tuple }) {
        this.writeIterable({
            writer,
            value,
            leftBrace: "[",
            rightBrace: "]"
        });
    }

    private writeIterable({
        writer,
        value,
        leftBrace,
        rightBrace
    }: {
        writer: Writer;
        value: IterableLiteral<IterableLiteralField>;
        leftBrace: string;
        rightBrace: string;
    }) {
        if (value.fields.length === 0) {
            // Don't allow "multiline" empty collections.
            writer.write(`${leftBrace}${rightBrace}`);
        } else {
            writer.writeLine(`${leftBrace}`);
            writer.indent();
            for (const elem of value.fields) {
                this.writeIterableField(writer, elem);
                writer.writeLine(",");
            }
            writer.dedent();
            writer.write(`${rightBrace}`);
        }
    }

    private writeIterableField(writer: Writer, value: IterableLiteralField) {
        switch (value.type) {
            case "objectField": {
                writer.write(`${value.name}: `);
                value.value.write(writer);
                break;
            }
            case "arrayField":
            case "tupleField": {
                value.value.write(writer);
                break;
            }
            default: {
                assertNever(value);
            }
        }
    }

    /* Static factory methods for creating a TypeLiteral */
    public static array({
        valueType,
        fields,
        multiline
    }: {
        valueType: Type;
        fields: ArrayField[];
        multiline?: boolean;
    }): TypeLiteral {
        return new this({
            type: "array",
            valueType,
            fields
        });
    }

    public static arrayField(value: TypeLiteral): ArrayField {
        return {
            type: "arrayField",
            value
        };
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value });
    }

    public static number(value: number): TypeLiteral {
        return new this({ type: "number", value });
    }

    public static object({ fields, multiline }: { fields: ObjectField[]; multiline?: boolean }): TypeLiteral {
        return new this({
            type: "object",
            fields
        });
    }

    public static objectField({
        name,
        valueType,
        value
    }: {
        name: string;
        valueType: Type;
        value: TypeLiteral;
    }): ObjectField {
        return {
            type: "objectField",
            name,
            valueType,
            value
        };
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static tuple({ fields, multiline }: { fields: TupleField[]; multiline?: boolean }): TypeLiteral {
        return new this({
            type: "tuple",
            fields
        });
    }

    public static tupleField({ valueType, value }: { valueType: Type; value: TypeLiteral }): TupleField {
        return {
            type: "tupleField",
            valueType,
            value
        };
    }
}
