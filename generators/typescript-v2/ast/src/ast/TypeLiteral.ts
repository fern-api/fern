import { assertNever } from "@fern-api/core-utils";

import { Type } from "./Type";
import { AstNode, Writer } from "./core";

type InternalTypeLiteral = Array_ | Boolean_ | BigInt_ | Number_ | Object_ | ObjectField | String_ | Tuple | NoOp;

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

interface BigInt_ {
    type: "bigint";
    value: bigint;
}

interface Object_ {
    type: "object";
    fields: ObjectField[];
}

interface ObjectField {
    type: "objectField";
    name: string;
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

interface NoOp {
    type: "noOp";
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
            case "objectField": {
                writer.write(`${this.internalType.name}: `);
                this.internalType.value.write(writer);
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
            case "noOp":
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
        if (iterable.values.length === 0) {
            // Don't allow "multiline" empty iterables.
            writer.write("[]");
        } else {
            writer.writeLine("[");
            writer.indent();
            for (const value of iterable.values) {
                value.write(writer);
                writer.writeLine(",");
            }
            writer.dedent();
            writer.write("]");
        }
    }

    private writeObject({ writer, object }: { writer: Writer; object: Object_ }): void {
        if (object.fields.length === 0) {
            // Don't allow "multiline" empty objects.
            writer.write("{}");
        } else {
            writer.writeLine("{");
            writer.indent();
            for (const field of object.fields) {
                writer.write(`${field.name}: `);
                field.value.write(writer);
                writer.writeLine(",");
            }
            writer.dedent();
            writer.write("}");
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

    public static object(fields: Record<string, TypeLiteral>): TypeLiteral {
        const objectFields: ObjectField[] = Object.entries(fields).map(([name, value]) => ({
            type: "objectField",
            name,
            value
        }));
        return new this({
            type: "object",
            fields: objectFields
        });
    }

    public static objectField(name: string, value: TypeLiteral): TypeLiteral {
        return new this({
            type: "objectField",
            name,
            value
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

    public static bigint(value: bigint): TypeLiteral {
        return new this({ type: "bigint", value });
    }

    public static noOp(): TypeLiteral {
        return new this({ type: "noOp" });
    }

    public static isNoOp(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "noOp";
    }
}
