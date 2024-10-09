import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { FuncInvocation } from "./FuncInvocation";
import { GoTypeReference } from "./GoTypeReference";
import { Type } from "./Type";
import { CodeBlock } from "./CodeBlock";

type InternalTypeInstantiation =
    | Any_
    | Bool
    | Bytes
    | Date
    | DateTime
    | Float64
    | Int
    | Int64
    | Optional
    | Slice
    | String_
    | Uuid;

interface Any_ {
    type: "any";
    value: unknown;
}

interface Bool {
    type: "bool";
    value: boolean;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface Date {
    type: "date";
    value: string;
}

interface DateTime {
    type: "dateTime";
    value: string;
}

interface Float64 {
    type: "float64";
    value: number;
}

interface Int {
    type: "int";
    value: number;
}

interface Int64 {
    type: "int64";
    value: number;
}

interface Optional {
    type: "optional";
    value: TypeInstantiation;
}

interface Slice {
    type: "slice";
    valueType: Type;
    values: TypeInstantiation[];
}

interface String_ {
    type: "string";
    value: string;
}

interface Uuid {
    type: "uuid";
    value: string;
}

const POINTER_HELPER_TYPES = new Set<string>(["bool", "date", "dateTime", "float64", "int", "int64", "string", "uuid"]);
const ADDRESSABLE_TYPES = new Set<string>(["any", "bytes", "slice"]);

export class TypeInstantiation extends AstNode {
    private constructor(public readonly internalType: InternalTypeInstantiation) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "any":
                // TODO: Write the given TypeScript unknown value as a Go type!
                break;
            case "bool":
                writer.write(this.internalType.value.toString());
                break;
            case "bytes":
                writer.write(`[]byte(${this.internalType.value})`);
                break;
            case "date":
            case "dateTime":
                writer.writeNode(invokeMustParseDate({ writer, type: this.internalType }));
                break;
            case "float64":
                writer.write(this.internalType.value.toString());
                break;
            case "int":
            case "int64":
                writer.write(this.internalType.value.toString());
                break;
            case "optional": {
                // TODO: We need to look ahead in order to know how to instantiate the type.
                //
                // This implementation isn't exhaustive yet (e.g. maps).
                if (POINTER_HELPER_TYPES.has(this.internalType.value.internalType.type)) {
                    writer.writeNode(invokePointerHelper({ writer, type: this.internalType.value }));
                    return;
                }
                if (ADDRESSABLE_TYPES.has(this.internalType.value.internalType.type)) {
                    this.internalType.value.write(writer);
                    return;
                }
                writer.write("&");
                this.internalType.value.write(writer);
                break;
            }
            case "slice":
                writer.write("[]");
                this.internalType.valueType.write(writer);
                if (this.internalType.values.length === 0) {
                    writer.write("{}");
                    return;
                }
                writer.writeLine("{");
                writer.indent();
                for (const value of this.internalType.values) {
                    value.write(writer);
                    writer.writeLine(",");
                }
                writer.dedent();
                writer.write("}");
                break;
            case "string":
                writer.write(`"${this.internalType.value}"`);
                break;
            case "uuid":
                writer.writeNode(invokeMustParseUUID({ value: this.internalType.value }));
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a TypeInstantiation */
    public static any(value: unknown): TypeInstantiation {
        return new this({
            type: "any",
            value
        });
    }

    public static bool(value: boolean): TypeInstantiation {
        return new this({
            type: "bool",
            value
        });
    }

    public static bytes(value: string): TypeInstantiation {
        return new this({
            type: "bytes",
            value
        });
    }

    public static date(value: string): TypeInstantiation {
        return new this({
            type: "date",
            value
        });
    }

    public static dateTime(value: string): TypeInstantiation {
        return new this({
            type: "dateTime",
            value
        });
    }

    public static float64(value: number): TypeInstantiation {
        return new this({
            type: "float64",
            value
        });
    }

    public static int(value: number): TypeInstantiation {
        return new this({
            type: "int",
            value
        });
    }

    public static int64(value: number): TypeInstantiation {
        return new this({
            type: "int64",
            value
        });
    }

    public static optional(value: TypeInstantiation): TypeInstantiation {
        return new this({
            type: "optional",
            value
        });
    }

    public static slice(valueType: Type, values: TypeInstantiation[]): TypeInstantiation {
        return new this({
            type: "slice",
            valueType,
            values
        });
    }

    public static string(value: string): TypeInstantiation {
        return new this({
            type: "string",
            value
        });
    }

    public static uuid(value: string): TypeInstantiation {
        return new this({
            type: "uuid",
            value
        });
    }
}

function invokePointerHelper({ writer, type }: { writer: Writer; type: TypeInstantiation }): FuncInvocation {
    return new FuncInvocation({
        func: new GoTypeReference({
            name: getPointerHelperFuncName({ type }),
            importPath: writer.rootImportPath
        }),
        arguments_: [type]
    });
}

function getPointerHelperFuncName({ type }: { type: TypeInstantiation }): string {
    switch (type.internalType.type) {
        case "bool":
            return "Bool";
        case "date":
        case "dateTime":
            return "Time";
        case "float64":
            return "Float64";
        case "int":
            return "Int";
        case "int64":
            return "Int64";
        case "string":
            return "String";
        case "uuid":
            return "UUID";
        default:
            return "";
    }
}

function invokeMustParseDate({ writer, type }: { writer: Writer; type: Date | DateTime }): FuncInvocation {
    const funcName = type instanceof Date ? "MustParseDate" : "MustParseDateTime";
    return new FuncInvocation({
        func: new GoTypeReference({
            name: funcName,
            importPath: writer.rootImportPath
        }),
        arguments_: [new CodeBlock(`"${type.value}"`)]
    });
}

function invokeMustParseUUID({ value }: { value: string }): FuncInvocation {
    return new FuncInvocation({
        func: new GoTypeReference({
            name: "MustParse",
            importPath: "github.com/google/uuid"
        }),
        arguments_: [new CodeBlock(`"${value}"`)]
    });
}
