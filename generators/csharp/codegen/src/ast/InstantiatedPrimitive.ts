import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalPrimitiveInstantiation =
    | IntegerInstantiation
    | LongInstantiation
    | UintInstantiation
    | UlongInstantiation
    | StringInstantiation
    | BooleanInstantiation
    | FloatInstanation
    | DoubleInstantiation
    | DateInstantiation
    | DateTimeInstantiation
    | GuidInstantiation
    | NullInstantiation;

interface IntegerInstantiation {
    type: "integer";
    value: number;
}

interface LongInstantiation {
    type: "long";
    value: number;
}

interface UintInstantiation {
    type: "uint";
    value: number;
}

interface UlongInstantiation {
    type: "ulong";
    value: number;
}

interface StringInstantiation {
    type: "string";
    value: string;
}

interface BooleanInstantiation {
    type: "boolean";
    value: boolean;
}

interface FloatInstanation {
    type: "float";
    value: number;
}

interface DoubleInstantiation {
    type: "double";
    value: number;
}

interface DateInstantiation {
    type: "date";
    value: string;
}

interface DateTimeInstantiation {
    type: "dateTime";
    value: Date;
}

interface GuidInstantiation {
    type: "uuid";
    value: string;
}

interface NullInstantiation {
    type: "null";
}

export class PrimitiveInstantiation extends AstNode {
    private constructor(public readonly internalType: InternalPrimitiveInstantiation) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "integer":
                writer.write(this.internalType.value.toString());
                break;
            case "long":
                writer.write(this.internalType.value.toString());
                break;
            case "uint":
                writer.write(this.internalType.value.toString());
                break;
            case "ulong":
                writer.write(this.internalType.value.toString());
                break;
            case "string":
                writer.write(`"${PrimitiveInstantiation.escapeForCSharp(this.internalType.value)}"`);
                break;
            case "boolean":
                writer.write(this.internalType.value.toString());
                break;
            case "float":
                writer.write(this.internalType.value.toString());
                break;
            case "double":
                writer.write(this.internalType.value.toString());
                break;
            case "date": {
                const date = new Date(this.internalType.value);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Months are zero-based
                const day = date.getDate();
                writer.write(`new DateOnly(${year}, ${month}, ${day})`);
                break;
            }
            case "dateTime": {
                const datetime = this.internalType.value;
                const dateTimeYear = datetime.getFullYear();
                const dateTimeMonth = (datetime.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
                const dateTimeDay = datetime.getDate().toString().padStart(2, "0");
                const hours = datetime.getHours().toString().padStart(2, "0");
                const minutes = datetime.getMinutes().toString().padStart(2, "0");
                const seconds = datetime.getSeconds().toString().padStart(2, "0");
                const milliseconds = datetime.getMilliseconds().toString().padStart(3, "0");
                writer.write(
                    `new DateTime(${dateTimeYear}, ${dateTimeMonth}, ${dateTimeDay}, ${hours}, ${minutes}, ${seconds}, ${milliseconds})`
                );
                break;
            }
            case "uuid":
                writer.write(this.internalType.value.toString());
                break;
            case "null":
                writer.write("null");
                break;
        }
    }

    public static string(value: string): PrimitiveInstantiation {
        return new this({
            type: "string",
            value
        });
    }

    public static boolean(value: boolean): PrimitiveInstantiation {
        return new this({
            type: "boolean",
            value
        });
    }

    public static integer(value: number): PrimitiveInstantiation {
        return new this({
            type: "integer",
            value
        });
    }

    public static long(value: number): PrimitiveInstantiation {
        return new this({
            type: "long",
            value
        });
    }

    public static uint(value: number): PrimitiveInstantiation {
        return new this({
            type: "uint",
            value
        });
    }

    public static ulong(value: number): PrimitiveInstantiation {
        return new this({
            type: "ulong",
            value
        });
    }

    public static float(value: number): PrimitiveInstantiation {
        return new this({
            type: "float",
            value
        });
    }

    public static double(value: number): PrimitiveInstantiation {
        return new this({
            type: "double",
            value
        });
    }

    public static date(value: string): PrimitiveInstantiation {
        return new this({
            type: "date",
            value
        });
    }

    public static dateTime(value: Date): PrimitiveInstantiation {
        return new this({
            type: "dateTime",
            value
        });
    }

    public static uuid(value: string): PrimitiveInstantiation {
        return new this({
            type: "uuid",
            value
        });
    }

    public static null(): PrimitiveInstantiation {
        return new this({
            type: "null"
        });
    }

    private static escapeForCSharp(input: string): string {
        return input
            .replace(/\\/g, "\\\\") // Escape backslashes
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t"); // Escape tabs
    }
}
