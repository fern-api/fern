import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

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
    parse: boolean;
}

interface GuidInstantiation {
    type: "uuid";
    value: string;
}

interface NullInstantiation {
    type: "null";
}

export class PrimitiveInstantiation extends AstNode {
    public constructor(
        public readonly internalType: InternalPrimitiveInstantiation,
        generation: Generation
    ) {
        super(generation);
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "integer":
                writer.write(this.internalType.value.toString());
                break;
            case "long":
                writer.write(`${this.internalType.value.toString()}`);
                break;
            case "uint":
                writer.write(`${this.internalType.value.toString()}`);
                break;
            case "ulong":
                writer.write(`${this.internalType.value.toString()}`);
                break;
            case "string":
                writer.writeNode(this.csharp.string_({ string: this.internalType.value }));
                break;
            case "boolean":
                writer.write(this.internalType.value.toString());
                break;
            case "float":
                writer.write(`${this.internalType.value.toString()}f`);
                break;
            case "double":
                writer.write(`${this.internalType.value.toString()}`);
                break;
            case "date": {
                const date = new Date(this.internalType.value);
                const year = this.csharp.Literal.integer(date.getUTCFullYear());
                const month = this.csharp.Literal.integer(date.getUTCMonth() + 1);
                const day = this.csharp.Literal.integer(date.getUTCDate());
                writer.write(this.System.DateOnly.new({ arguments_: [year, month, day] }));
                break;
            }
            case "dateTime": {
                if (this.internalType.parse) {
                    writer.write(`DateTime.Parse("${this.internalType.value.toISOString()}", null, `);
                    writer.writeNode(this.System.Globalization.DateTimeStyles);
                    writer.write(".AdjustToUniversal)");
                } else {
                    writer.write(this.constructDatetimeWithoutParse(this.internalType.value));
                }
                break;
            }
            case "uuid":
                writer.write(`"${this.internalType.value.toString()}"`);
                break;
            case "null":
                writer.write("null");
                break;
        }
    }

    /*
     * Currently unused because it was easier to just use `.Parse` to get passing wire tests.
     */
    private constructDatetimeWithoutParse(datetime: Date): string {
        const dateTimeYear = datetime.getUTCFullYear();
        const dateTimeMonth = (datetime.getUTCMonth() + 1).toString().padStart(2, "0");
        const dateTimeDay = datetime.getUTCDate().toString().padStart(2, "0");
        const hours = datetime.getUTCHours().toString().padStart(2, "0");
        const minutes = datetime.getUTCMinutes().toString().padStart(2, "0");
        const seconds = datetime.getUTCSeconds().toString().padStart(2, "0");
        const milliseconds = datetime.getUTCMilliseconds().toString().padStart(3, "0");
        return `new DateTime(${dateTimeYear}, ${dateTimeMonth}, ${dateTimeDay}, ${hours}, ${minutes}, ${seconds}, ${milliseconds})`;
    }
}
