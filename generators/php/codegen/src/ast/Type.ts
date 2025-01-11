import { assertNever } from "@fern-api/core-utils";

import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { GLOBAL_NAMESPACE } from "./core/Constant";
import { Writer } from "./core/Writer";

type InternalType =
    | Int
    | String_
    | Bool
    | Float
    | Date
    | DateTime
    | Mixed
    | Object_
    | Array_
    | Map
    | TypeDict
    | Union
    | Optional
    | Reference
    | EnumString;

interface Int {
    type: "int";
}

interface String_ {
    type: "string";
}

interface Bool {
    type: "bool";
}

interface Float {
    type: "float";
}

interface Date {
    type: "date";
}

interface DateTime {
    type: "dateTime";
}

interface Mixed {
    type: "mixed";
}

interface Object_ {
    type: "object";
}

interface Array_ {
    type: "array";
    value: Type;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
}

interface TypeDict {
    type: "typeDict";
    entries: TypeDictEntry[];
    multiline?: boolean;
}

interface Union {
    type: "union";
    types: Type[];
}

interface TypeDictEntry {
    key: string;
    valueType: Type;
    optional?: boolean;
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Reference {
    type: "reference";
    value: ClassReference;
}

interface EnumString {
    type: "enumString";
    value: ClassReference;
}

/* A PHP parameter to a method */
export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer, { comment }: { comment?: boolean } = {}): void {
        switch (this.internalType.type) {
            case "int":
                writer.write("int");
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
            case "date":
                writer.addReference(DateTimeClassReference);
                writer.write("DateTime");
                break;
            case "dateTime":
                writer.addReference(DateTimeClassReference);
                writer.write("DateTime");
                break;
            case "mixed":
                writer.write("mixed");
                break;
            case "object":
                writer.write("object");
                break;
            case "array":
                if (!comment) {
                    writer.write("array");
                    break;
                }
                writer.write("array<");
                this.internalType.value.write(writer, { comment });
                writer.write(">");
                break;
            case "map": {
                if (!comment) {
                    writer.write("array");
                    break;
                }
                writer.write("array<");
                this.internalType.keyType.write(writer, { comment });
                writer.write(", ");
                this.internalType.valueType.write(writer, { comment });
                writer.write(">");
                break;
            }
            case "typeDict": {
                if (!comment) {
                    writer.write("array");
                    break;
                }
                if (this.internalType.multiline) {
                    writer.writeLine("array{");
                    for (const entry of this.internalType.entries) {
                        writer.write(" *   ");
                        this.writeTypeDictEntry({ writer, entry, comment });
                        writer.writeLine(",");
                    }
                    writer.write(" * }");
                    break;
                }
                writer.write("array{");
                this.internalType.entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    this.writeTypeDictEntry({ writer, entry, comment });
                });
                writer.write("}");
                break;
            }
            case "union": {
                const types = this.getUniqueTypes({ types: this.internalType.types, comment, writer });
                types.forEach((type, index) => {
                    if (index > 0) {
                        writer.write("|");
                    }
                    type.write(writer, { comment });
                    index++;
                });
                break;
            }
            case "optional": {
                const isMixed = this.internalType.value.internalType.type === "mixed";
                const isUnion = this.internalType.value.internalType.type === "union";
                if (!isUnion && !isMixed) {
                    writer.write("?");
                }
                this.internalType.value.write(writer, { comment });
                if (isUnion) {
                    writer.write("|null");
                }
                break;
            }
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "enumString":
                if (comment) {
                    writer.write("value-of<");
                    writer.writeNode(this.internalType.value);
                    writer.write(">");
                } else {
                    writer.write("string");
                }
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public toOptionalIfNotAlready(): Type {
        if (this.internalType.type === "optional") {
            return this;
        }
        return Type.optional(this);
    }

    public underlyingTypeIfOptional(): Type | undefined {
        if (this.internalType.type === "optional") {
            return this.internalType.value;
        }
        return undefined;
    }

    public underlyingType(): Type {
        return this.underlyingTypeIfOptional() ?? this;
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static int(): Type {
        return new this({
            type: "int"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static bool(): Type {
        return new this({
            type: "bool"
        });
    }

    public static float(): Type {
        return new this({
            type: "float"
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

    public static mixed(): Type {
        return new this({
            type: "mixed"
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

    public static map(keyType: Type, valueType: Type): Type {
        return new this({
            type: "map",
            keyType,
            valueType
        });
    }

    public static typeDict(entries: TypeDictEntry[], { multiline }: { multiline?: boolean } = {}): Type {
        return new this({
            type: "typeDict",
            entries,
            multiline
        });
    }

    public static union(types: Type[]): Type {
        return new this({
            type: "union",
            types
        });
    }

    public static optional(value: Type): Type {
        // Avoids double optional.
        if (this.isAlreadyOptional(value)) {
            return value;
        }
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

    public static enumString(value: ClassReference): Type {
        return new this({
            type: "enumString",
            value
        });
    }

    private static isAlreadyOptional(value: Type) {
        return value.internalType.type === "optional";
    }

    private writeTypeDictEntry({
        writer,
        entry,
        comment
    }: {
        writer: Writer;
        entry: TypeDictEntry;
        comment?: boolean;
    }) {
        writer.write(entry.key);
        if (entry.optional) {
            writer.write("?");
        }
        writer.write(": ");
        entry.valueType.write(writer, { comment });
    }

    private getUniqueTypes({
        writer,
        types,
        comment
    }: {
        writer: Writer;
        types: Type[];
        comment: boolean | undefined;
    }): Type[] {
        const typeStrings = new Set();
        return types.filter((type) => {
            if (comment) {
                return true;
            }
            const typeString = type.toString({
                namespace: writer.namespace,
                rootNamespace: writer.rootNamespace,
                customConfig: writer.customConfig
            });
            // handle potential duplicates, such as strings (due to enums) and arrays
            if (typeStrings.has(typeString)) {
                return false;
            }
            typeStrings.add(typeString);
            return true;
        });
    }
}

export const DateTimeClassReference = new ClassReference({
    namespace: GLOBAL_NAMESPACE,
    name: "DateTime"
});
