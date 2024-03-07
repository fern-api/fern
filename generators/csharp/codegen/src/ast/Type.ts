import { assertNever } from "@fern-api/core-utils";
import { ContainerType, DeclaredTypeName, Literal, MapType, PrimitiveType, TypeReference } from "@fern-fern/ir-sdk/api";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Class } from "./Class";
import { ClassReference } from "./ClassReference";

type InternalType =
    | Integer
    | Long
    | String_
    | Boolean_
    | Double
    | Date
    | DateTime
    | Uuid
    | Object_
    | List
    | Set
    | Map
    | Optional
    | Reference;

interface Integer {
    type: "integer";
}

interface Long {
    type: "long";
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
            case "long":
                writer.write("long");
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
                writer.write("List<");
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
                writer.write(",");
                this.internalType.valueType.write(writer);
                writer.write(">");
                break;
            case "optional":
                this.internalType.value.write(writer);
                writer.write("?");
                break;
            case "reference":
                writer.addReference(this.internalType.value);
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

    public static long(): Type {
        return new this({
            type: "long"
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

    private static typeFromContainerReference(rootModule: string, containerType: ContainerType): Type {
        return containerType._visit<Type>({
            list: (value: TypeReference) => Type.list(Type.typeFromTypeReference(rootModule, value)),
            map: (value: MapType) =>
                Type.map(
                    Type.typeFromTypeReference(rootModule, value.keyType),
                    Type.typeFromTypeReference(rootModule, value.valueType)
                ),
            set: (value: TypeReference) => Type.set(Type.typeFromTypeReference(rootModule, value)),
            optional: (value: TypeReference) => Type.optional(Type.typeFromTypeReference(rootModule, value)),
            literal: (value: Literal) =>
                value._visit<Type>({
                    string: () => Type.string(),
                    boolean: () => Type.boolean(),
                    _other: () => Type.object()
                }),
            _other: () => Type.object()
        });
    }

    public static typeFromTypeReference(rootModule: string, typeReference: TypeReference): Type {
        return typeReference._visit<Type>({
            container: (value: ContainerType) => Type.typeFromContainerReference(rootModule, value),
            named: (value: DeclaredTypeName) =>
                Type.reference(
                    new ClassReference({
                        name: value.name.pascalCase.safeName,
                        namespace: Class.getNamespaceFromFernFilepath(rootModule, value.fernFilepath)
                    })
                ),
            primitive: (value: PrimitiveType) =>
                PrimitiveType._visit<Type>(value, {
                    integer: () => Type.integer(),
                    double: () => Type.double(),
                    string: () => Type.string(),
                    boolean: () => Type.boolean(),
                    long: () => Type.long(),
                    date: () => Type.date(),
                    dateTime: () => Type.dateTime(),
                    uuid: () => Type.uuid(),
                    // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
                    base64: () => Type.string(),
                    _other: () => Type.object()
                }),
            unknown: () => Type.object(),
            _other: () => Type.object()
        });
    }
}
