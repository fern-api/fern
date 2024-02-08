import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";

type InternalType = Integer | String_ | Boolean_ | Double | List | Set | Optional | Reference;

interface Integer {
    type: "integer";
}

interface String_ {
    type: "string";
}

interface Boolean_ {
    type: "boolean";
}

interface Double {
    type: "double";
}

interface List {
    type: "list";
    value: Type;
}

interface Set {
    type: "set";
    value: Type;
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Reference {
    type: "reference";
    value: ClassReference;
}

/* A C# parameter to a method */
export class Type extends AstNode {
    private constructor(private readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "integer":
                writer.write("int");
                break;
            case "string":
                writer.write("string");
                break;
            case "boolean":
                writer.write("bool");
                break;
            case "double":
                writer.write("double");
                break;
            case "list":
                writer.write("List<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "set":
                writer.write("HashSet<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "optional":
                this.internalType.value.write(writer);
                writer.write("?");
                break;
            case "reference":
                this.addReference(this.internalType.value);
                writer.write(this.internalType.value.name);
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a Type */
    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static integer(): Type {
        return new this({
            type: "integer"
        });
    }

    public static double(): Type {
        return new this({
            type: "double"
        });
    }

    public static list(value: Type): Type {
        return new this({
            type: "list",
            value
        });
    }

    public static set(value: Type): Type {
        return new this({
            type: "set",
            value
        });
    }

    public static optional(value: Type): Type {
        return new this({
            type: "optional",
            value
        });
    }

    public static reference(value: ClassReference): Type {
        return new this({
            type: "reference",
            value
        });
    }
}
