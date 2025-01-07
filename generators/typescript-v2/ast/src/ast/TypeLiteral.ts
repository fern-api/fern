import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";

type InternalTypeLiteral = Array_ | Boolean_ | BigInt_ | Number_ | Object_ | String_ | Tuple | Nop;

interface Array_ {
    type: "array";
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

interface BigInt_ {
    type: "bigint";
    value: bigint;
}

interface Object_ {
    type: "object";
    fields: ObjectField[];
}

export interface ObjectField {
    name: string;
    value: TypeLiteral;
}

interface String_ {
    type: "string";
    value: string;
}

interface Tuple {
    type: "tuple";
    values: TypeLiteral[];
}

interface Nop {
    type: "nop";
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "array": {
                this.writeIterable({ writer, iterable: this.internalType });
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
            case "bigint": {
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
                this.writeIterable({ writer, iterable: this.internalType });
                break;
            }
            case "nop":
                break;
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

    private writeIterable({ writer, iterable }: { writer: Writer; iterable: Array_ | Tuple }): void {
        const values = filterNopValues({ values: iterable.values });
        if (values.length === 0) {
            writer.write("[]");
            return;
        }

        writer.writeLine("[");
        writer.indent();
        for (const value of values) {
            value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("]");
    }

    private writeObject({ writer, object }: { writer: Writer; object: Object_ }): void {
        const fields = filterNopObjectFields({ fields: object.fields });
        if (fields.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();
        for (const field of fields) {
            writer.write(`${field.name}: `);
            field.value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    /* Static factory methods for creating a TypeLiteral */
    public static array({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "array",
            values
        });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value });
    }

    public static number(value: number): TypeLiteral {
        return new this({ type: "number", value });
    }

    public static object({ fields }: { fields: ObjectField[] }): TypeLiteral {
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

    public static tuple({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "tuple",
            values
        });
    }

    public static bigint(value: bigint): TypeLiteral {
        return new this({ type: "bigint", value });
    }

    public static nop(): TypeLiteral {
        return new this({ type: "nop" });
    }

    public static isNop(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "nop";
    }
}

function filterNopObjectFields({ fields }: { fields: ObjectField[] }): ObjectField[] {
    return fields.filter((field) => !TypeLiteral.isNop(field.value));
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value));
}
