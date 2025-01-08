import { assertNever } from "@fern-api/core-utils";

import { python } from ".";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType =
    | Int
    | Float
    | Bool
    | Str
    | Bytes
    | List
    | Set
    | Tuple
    | Dict
    | None
    | Uuid
    | Optional
    | Union
    | Any
    | ReferenceType
    | Datetime
    | Literal;

interface Int {
    type: "int";
}

interface Float {
    type: "float";
}

interface Bool {
    type: "bool";
}

interface Str {
    type: "str";
}

interface Bytes {
    type: "bytes";
}

interface List {
    type: "list";
    value: Type;
}

interface Set {
    type: "set";
    value: Type;
}

interface Tuple {
    type: "tuple";
    values: Type[];
}

interface Dict {
    type: "dict";
    keyType: Type;
    valueType: Type;
}

interface None {
    type: "none";
}

interface Uuid {
    type: "uuid";
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Union {
    type: "union";
    values: Type[];
}

interface Datetime {
    type: "datetime";
}

interface Any {
    type: "any";
}

interface ReferenceType {
    type: "reference";
    value: Reference;
}

interface Literal {
    type: "literal";
    value: string | number | boolean;
}

export class Type extends AstNode {
    private internalType: InternalType;

    private constructor(internalType: InternalType) {
        super();
        this.internalType = internalType;
    }

    public static int(): Type {
        return new this({ type: "int" });
    }

    public static float(): Type {
        return new this({ type: "float" });
    }

    public static bool(): Type {
        return new this({ type: "bool" });
    }

    public static str(): Type {
        return new this({ type: "str" });
    }

    public static bytes(): Type {
        return new this({ type: "bytes" });
    }

    public static list(value: Type): Type {
        const listType = new this({ type: "list", value });
        listType.addReference(python.reference({ name: "List", modulePath: ["typing"] }));
        listType.inheritReferences(value);
        return listType;
    }

    public static set(value: Type): Type {
        const setType = new this({ type: "set", value });
        setType.addReference(python.reference({ name: "Set", modulePath: ["typing"] }));
        setType.inheritReferences(value);
        return setType;
    }

    public static tuple(values: Type[]): Type {
        const tupleType = new this({ type: "tuple", values });
        tupleType.addReference(python.reference({ name: "Tuple", modulePath: ["typing"] }));
        values.forEach((value) => tupleType.inheritReferences(value));
        return tupleType;
    }

    public static dict(keyType: Type, valueType: Type): Type {
        const dictType = new this({ type: "dict", keyType, valueType });
        dictType.addReference(python.reference({ name: "Dict", modulePath: ["typing"] }));
        dictType.inheritReferences(keyType);
        dictType.inheritReferences(valueType);
        return dictType;
    }

    public static none(): Type {
        return new this({ type: "none" });
    }

    public static uuid(): Type {
        const uuidType = new this({ type: "uuid" });
        uuidType.addReference(python.reference({ name: "UUID", modulePath: ["uuid"] }));
        return uuidType;
    }

    public static optional(value: Type): Type {
        const optionalType = new this({ type: "optional", value });
        optionalType.addReference(python.reference({ name: "Optional", modulePath: ["typing"] }));
        optionalType.inheritReferences(value);
        return optionalType;
    }

    public static union(values: Type[]): Type {
        const unionType = new this({ type: "union", values });
        unionType.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));
        values.forEach((value) => unionType.inheritReferences(value));
        return unionType;
    }

    public static any(): Type {
        const anyType = new this({ type: "any" });
        anyType.addReference(python.reference({ name: "Any", modulePath: ["typing"] }));
        return anyType;
    }

    public static datetime(): Type {
        const datetimeType = new this({ type: "datetime" });
        datetimeType.addReference(python.reference({ name: "datetime", modulePath: ["datetime"] }));
        return datetimeType;
    }

    public static reference(value: Reference): Type {
        const referenceType = new this({ type: "reference", value });
        referenceType.addReference(value);
        return referenceType;
    }

    public static literal(value: string | boolean | number): Type {
        const literalType = new this({ type: "literal", value });
        literalType.addReference(python.reference({ name: "Literal", modulePath: ["typing"] }));
        return literalType;
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "int":
                writer.write("int");
                break;
            case "float":
                writer.write("float");
                break;
            case "bool":
                writer.write("bool");
                break;
            case "str":
                writer.write("str");
                break;
            case "bytes":
                writer.write("bytes");
                break;
            case "list":
                writer.write("List[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "set":
                writer.write("Set[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "tuple":
                writer.write("Tuple[");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("]");
                break;
            case "dict":
                writer.write("Dict[");
                this.internalType.keyType.write(writer);
                writer.write(", ");
                this.internalType.valueType.write(writer);
                writer.write("]");
                break;
            case "none":
                writer.write("None");
                break;
            case "uuid":
                writer.write("UUID");
                break;
            case "optional":
                writer.write("Optional[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "union":
                writer.write("Union[");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("]");
                break;
            case "any":
                writer.write("Any");
                break;
            case "reference":
                this.internalType.value.write(writer);
                break;
            case "datetime":
                writer.write("datetime");
                break;
            case "literal":
                if (typeof this.internalType.value === "string") {
                    writer.write(`Literal["${this.internalType.value}"]`);
                } else {
                    writer.write(`Literal[${this.internalType.value}]`);
                }
                break;
            default:
                assertNever(this.internalType);
        }
    }
}
