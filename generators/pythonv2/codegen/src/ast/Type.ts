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
        return new Type({ type: "list", value });
    }

    public static set(value: Type): Type {
        return new Type({ type: "set", value });
    }

    public static tuple(values: Type[]): Type {
        return new Type({ type: "tuple", values });
    }

    public static dict(keyType: Type, valueType: Type): Type {
        return new Type({ type: "dict", keyType, valueType });
    }

    public static none(): Type {
        return new Type({ type: "none" });
    }

    public static optional(value: Type): Type {
        return new Type({ type: "optional", value });
    }

    public static union(values: Type[]): Type {
        return new Type({ type: "union", values });
    }

    public static any(): Type {
        return new Type({ type: "any" });
    }

    public static reference(value: Reference): Type {
        return new Type({ type: "reference", value });
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
                this.addReference(python.reference({ name: "List", modulePath: ["typing"] }));
                writer.write("List[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "set":
                this.addReference(python.reference({ name: "Set", modulePath: ["typing"] }));
                writer.write("Set[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "tuple":
                this.addReference(python.reference({ name: "Tuple", modulePath: ["typing"] }));
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
                this.addReference(python.reference({ name: "Dict", modulePath: ["typing"] }));
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
                this.addReference(python.reference({ name: "Optional", modulePath: ["typing"] }));
                writer.write("Optional[");
                this.internalType.value.write(writer);
                writer.write("]");
                break;
            case "union":
                this.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));
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
                this.addReference(python.reference({ name: "Any", modulePath: ["typing"] }));
                writer.write("Any");
                break;
            case "reference":
                this.addReference(this.internalType.value);
                this.internalType.value.write(writer);
                break;
            default:
                assertNever(this.internalType);
        }
    }
}
