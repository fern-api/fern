import { assertNever } from "@fern-api/core-utils";
import { ClassReference, OneOfClassReference, StringEnumClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { CoreClassReference } from "./CoreClassReference";

type InternalType =
    | Integer
    | Long
    | Uint
    | Ulong
    | String_
    | Boolean_
    | Float
    | Double
    | Date
    | DateTime
    | Uuid
    | Object_
    | List
    | Set
    | Map
    | Optional
    | Reference
    | OneOf
    | StringEnum
    | CoreReference;

interface Integer {
    type: "integer";
}

interface Long {
    type: "long";
}

interface Uint {
    type: "uint";
}

interface Ulong {
    type: "ulong";
}

interface String_ {
    type: "string";
}

interface Boolean_ {
    type: "boolean";
}

interface Float {
    type: "float";
}

interface Double {
    type: "double";
}

interface Date {
    type: "date";
}

interface DateTime {
    type: "dateTime";
}

interface Uuid {
    type: "uuid";
}

interface Object_ {
    type: "object";
}

interface List {
    type: "list";
    value: Type;
}

interface Set {
    type: "set";
    value: Type;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Reference {
    type: "reference";
    value: ClassReference;
}

interface CoreReference {
    type: "coreReference";
    value: CoreClassReference;
}

interface OneOf {
    type: "oneOf";
    memberValues: Type[];
}

interface StringEnum {
    type: "stringEnum";
    value: ClassReference;
}

/* A C# parameter to a method */
export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer, parentType: Type | undefined = undefined): void {
        switch (this.internalType.type) {
            case "integer":
                writer.write("int");
                break;
            case "long":
                writer.write("long");
                break;
            case "uint":
                writer.write("uint");
                break;
            case "ulong":
                writer.write("ulong");
                break;
            case "string":
                writer.write("string");
                break;
            case "boolean":
                writer.write("bool");
                break;
            case "float":
                writer.write("float");
                break;
            case "double":
                writer.write("double");
                break;
            case "date":
                writer.write("DateOnly");
                break;
            case "dateTime":
                writer.write("DateTime");
                break;
            case "uuid":
                writer.write("Guid");
                break;
            case "object":
                writer.write("object");
                break;
            case "list":
                writer.write("IEnumerable<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "set":
                writer.write("HashSet<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "map":
                writer.write("Dictionary<");
                this.internalType.keyType.write(writer);
                writer.write(", ");
                this.internalType.valueType.write(writer);
                writer.write(">");
                break;
            case "optional":
                this.internalType.value.write(writer, this);
                // avoid double optional
                if (parentType?.internalType?.type !== "optional") {
                    writer.write("?");
                }
                break;
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "coreReference":
                writer.write(this.internalType.value.name);
                break;
            case "oneOf":
                writer.addReference(OneOfClassReference);
                writer.write("OneOf<");
                this.internalType.memberValues.forEach((value, index) => {
                    if (index !== 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write(">");
                break;
            case "stringEnum":
                writer.addReference(StringEnumClassReference);
                writer.write("StringEnum<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        switch (this.internalType.type) {
            case "list":
                writer.write(" = new List<");
                this.internalType.value.write(writer);
                writer.write(">();");
                break;
            case "set":
                writer.write(" = new HashSet<");
                this.internalType.value.write(writer);
                writer.write(">();");
                break;
            case "map":
                writer.write(" = new Dictionary<");
                this.internalType.keyType.write(writer);
                writer.write(", ");
                this.internalType.valueType.write(writer);
                writer.write(">();");
                break;
        }
    }

    public isCollection(): boolean {
        return ["list", "set", "map"].includes(this.internalType.type);
    }

    public toOptionalIfNotAlready(): Type {
        if (this.internalType.type === "optional") {
            return this;
        }
        return Type.optional(this);
    }

    public underlyingTypeIfOptional(): Type | undefined {
        if (this.internalType.type === "optional") {
            return (this.internalType as Optional).value;
        }
        return undefined;
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

    public static long(): Type {
        return new this({
            type: "long"
        });
    }

    public static uint(): Type {
        return new this({
            type: "uint"
        });
    }

    public static ulong(): Type {
        return new this({
            type: "ulong"
        });
    }

    public static float(): Type {
        return new this({
            type: "float"
        });
    }

    public static double(): Type {
        return new this({
            type: "double"
        });
    }

    public static date(): Type {
        return new this({
            type: "date"
        });
    }

    public static dateTime(): Type {
        return new this({
            type: "dateTime"
        });
    }

    public static uuid(): Type {
        return new this({
            type: "uuid"
        });
    }

    public static object(): Type {
        return new this({
            type: "object"
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

    public static map(keyType: Type, valueType: Type): Type {
        return new this({
            type: "map",
            keyType,
            valueType
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

    public static coreClass(value: CoreClassReference): Type {
        return new this({
            type: "coreReference",
            value
        });
    }

    public static oneOf(memberValues: Type[]): Type {
        return new this({
            type: "oneOf",
            memberValues
        });
    }

    public static stringEnum(value: ClassReference): Type {
        return new this({
            type: "stringEnum",
            value
        });
    }
}
