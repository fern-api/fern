import { assertNever } from "@fern-api/core-utils";
import { python } from "..";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";

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
    | Optional
    | Union
    | Any
    | ReferenceType;

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

interface Optional {
    type: "optional";
    value: Type;
}

interface Union {
    type: "union";
    values: Type[];
}

interface Any {
    type: "any";
}

interface ReferenceType {
    type: "reference";
    value: Reference;
}

export class Type extends AstNode {
    private internalType: InternalType;

    private constructor(internalType: InternalType) {
        super();
        this.internalType = internalType;
    }

    public static int(): Type {
        return new Type({ type: "int" });
    }

    public static float(): Type {
        return new Type({ type: "float" });
    }

    public static bool(): Type {
        return new Type({ type: "bool" });
    }

    public static str(): Type {
        return new Type({ type: "str" });
    }

    public static bytes(): Type {
        return new Type({ type: "bytes" });
    }

    public static list(value: Type): Type {
        const listType = new Type({ type: "list", value });
        listType.addReference(python.reference({ name: "List", modulePath: ["typing"] }));
        listType.maybeAddReference(value);
        return listType;
    }

    public static set(value: Type): Type {
        const setType = new Type({ type: "set", value });
        setType.addReference(python.reference({ name: "Set", modulePath: ["typing"] }));
        setType.maybeAddReference(value);
        return setType;
    }

    public static tuple(values: Type[]): Type {
        const tupleType = new Type({ type: "tuple", values });
        tupleType.addReference(python.reference({ name: "Tuple", modulePath: ["typing"] }));
        values.forEach((value) => tupleType.maybeAddReference(value));
        return tupleType;
    }

    public static dict(keyType: Type, valueType: Type): Type {
        const dictType = new Type({ type: "dict", keyType, valueType });
        dictType.addReference(python.reference({ name: "Dict", modulePath: ["typing"] }));
        dictType.maybeAddReference(keyType);
        dictType.maybeAddReference(valueType);
        return dictType;
    }

    public static none(): Type {
        return new Type({ type: "none" });
    }

    public static optional(value: Type): Type {
        const optionalType = new Type({ type: "optional", value });
        optionalType.addReference(python.reference({ name: "Optional", modulePath: ["typing"] }));
        optionalType.maybeAddReference(value);
        return optionalType;
    }

    public static union(values: Type[]): Type {
        const unionType = new Type({ type: "union", values });
        unionType.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));
        values.forEach((value) => unionType.maybeAddReference(value));
        return unionType;
    }

    public static any(): Type {
        const anyType = new Type({ type: "any" });
        anyType.addReference(python.reference({ name: "Any", modulePath: ["typing"] }));
        return anyType;
    }

    public static reference(value: Reference): Type {
        const referenceType = new Type({ type: "reference", value });
        referenceType.addReference(value);
        return referenceType;
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
            default:
                assertNever(this.internalType);
        }
    }

    private maybeAddReference(type: Type): void {
        type.getReferences().forEach((reference) => this.addReference(reference));
    }
}
