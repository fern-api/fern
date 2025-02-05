import { assertNever } from "@fern-api/core-utils";

import { PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";

import { BaseCsharpCustomConfigSchema } from "../custom-config";
import { Namespace } from "../project/CSharpFile";
import {
    ClassReference,
    OneOfBaseClassReference,
    OneOfClassReference,
    StringEnumClassReference
} from "./ClassReference";
import { CoreClassReference } from "./CoreClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

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
    | Array_
    | ListType
    | List
    | Set
    | Map
    | KeyValuePair
    | Optional
    | Reference
    | OneOf
    | OneOfBase
    | StringEnum
    | CoreReference;

interface Integer {
    type: "int";
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
    type: "bool";
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

interface Array_ {
    type: "array";
    value: Type;
}

interface ListType {
    type: "listType";
    value: Type;
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

interface KeyValuePair {
    type: "keyValuePair";
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

interface OneOfBase {
    type: "oneOfBase";
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
            case "int":
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
            case "bool":
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
                writer.write("string");
                break;
            case "object":
                writer.write("object");
                break;
            case "array":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                this.internalType.value.write(writer);
                writer.write("[]");
                break;
            case "listType":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                writer.write("List<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "list":
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    this.writeReadOnlyMemoryType({ writer, value: this.internalType.value });
                    break;
                }
                writer.write("IEnumerable<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "set":
                writer.write("HashSet<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "map": {
                const keyType = this.internalType.keyType;
                const valueType = this.internalType.valueType;
                if (
                    writer.getSimplifyObjectDictionaries() &&
                    keyType.internalType.type === "string" &&
                    valueType.internalType.type === "optional" &&
                    valueType.internalType.value.internalType.type === "object"
                ) {
                    writer.write("object");
                    break;
                }
                writer.write("Dictionary<");
                keyType.write(writer);
                writer.write(", ");
                valueType.write(writer);
                writer.write(">");
                break;
            }
            case "keyValuePair": {
                const keyType = this.internalType.keyType;
                const valueType = this.internalType.valueType;
                writer.write("KeyValuePair<");
                keyType.write(writer);
                writer.write(", ");
                valueType.write(writer);
                writer.write(">");
                break;
            }
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
            case "oneOfBase":
                writer.addReference(OneOfBaseClassReference);
                writer.write("OneOfBase<");
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
                if (isReadOnlyMemoryType({ writer, value: this.internalType.value })) {
                    return;
                }
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

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "bool"
        });
    }

    public static integer(): Type {
        return new this({
            type: "int"
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

    public static array(value: Type): Type {
        return new this({
            type: "array",
            value
        });
    }

    public static listType(value: Type): Type {
        return new this({
            type: "listType",
            value
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

    public static keyValuePair(keyType: Type, valueType: Type): Type {
        return new this({
            type: "keyValuePair",
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

    public static oneOfBase(memberValues: Type[]): Type {
        return new this({
            type: "oneOfBase",
            memberValues
        });
    }

    public static stringEnum(value: ClassReference): Type {
        return new this({
            type: "stringEnum",
            value
        });
    }

    private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
        writer.write("ReadOnlyMemory<");
        value.write(writer);
        writer.write(">");
    }
}

/**
 * The set of valid types supported by the 'read-only-memory-types' custom config option.
 *
 * The types are expressed in their C# type representation so that users can more easily
 * control the generated code.
 *
 * Also note that we use the InternalType's type property to determine the type of the Type
 * so that the two always remain in sync.
 */
export const VALID_READ_ONLY_MEMORY_TYPES = new Set<string>([
    Type.integer().internalType.type,
    Type.long().internalType.type,
    Type.uint().internalType.type,
    Type.ulong().internalType.type,
    Type.string().internalType.type,
    Type.boolean().internalType.type,
    Type.float().internalType.type,
    Type.double().internalType.type
]);

export function convertReadOnlyPrimitiveTypes(readOnlyMemoryTypeNames: string[]): PrimitiveTypeV1[] {
    return readOnlyMemoryTypeNames.map((typeName) => {
        switch (typeName) {
            case "int":
                return PrimitiveTypeV1.Integer;
            case "long":
                return PrimitiveTypeV1.Long;
            case "uint":
                return PrimitiveTypeV1.Uint;
            case "ulong":
                return PrimitiveTypeV1.Uint64;
            case "string":
                return PrimitiveTypeV1.String;
            case "bool":
                return PrimitiveTypeV1.Boolean;
            case "float":
                return PrimitiveTypeV1.Float;
            case "double":
                return PrimitiveTypeV1.Double;
            default:
                // This should be unreachable; the ReadOnlyMemory types should have already
                // been validated at this point.
                throw new Error(`Internal error; unknown ReadOnlyMemory type: ${typeName}`);
        }
    });
}

function isReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): boolean {
    if (value.internalType.type === "optional") {
        return isReadOnlyMemoryType({ writer, value: value.internalType.value });
    }
    return writer.isReadOnlyMemoryType(value.internalType.type);
}
