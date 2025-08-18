import { assertNever } from "@fern-api/core-utils";
import { isEqual, uniqWith } from "lodash-es";

import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { GLOBAL_NAMESPACE } from "./core/Constant";
import { Writer } from "./core/Writer";
import { TypeLiteral } from "./TypeLiteral";

type InternalType =
    | Array_
    | Bool
    | Date
    | DateTime
    | EnumString
    | Float
    | Int
    | Map
    | Mixed
    | Null
    | Object_
    | Optional
    | Reference
    | String_
    | TypeDict
    | Union
    | Literal;

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

interface Null {
    type: "null";
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

type LiteralString = TypeLiteral & {
    internalType: {
        type: "string";
        value: string;
    };
};

type LiteralBoolean = TypeLiteral & {
    internalType: {
        type: "boolean";
        value: boolean;
    };
};

type LiteralValue = LiteralString | LiteralBoolean;

interface Literal {
    type: "literal";
    value: LiteralValue;
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
            case "null": {
                writer.write("null");
                break;
            }
            case "typeDict": {
                if (!comment) {
                    writer.write("array");
                    break;
                }
                if (this.internalType.multiline) {
                    writer.writeLine("array{");

                    // NOTE: Put all required types before all optional parameters
                    // since this is required by PHPStan
                    const requiredTypes = this.internalType.entries.filter((entry) => !entry.valueType.isOptional());
                    const optionalTypes = this.internalType.entries.filter((entry) => entry.valueType.isOptional());
                    const orderedEntries = [...requiredTypes, ...optionalTypes];

                    for (const entry of orderedEntries) {
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
                this.writeUnion({ writer, unionTypes: this.internalType.types, comment });
                break;
            }
            case "optional": {
                const internalType = this.internalType.value.internalType;
                const isMixed = internalType.type === "mixed";
                const isUnion = internalType.type === "union";
                if (!isUnion && !isMixed) {
                    writer.write("?");
                }
                this.internalType.value.write(writer, { comment });
                if (isUnion && !this.unionHasOptional(internalType.types)) {
                    writer.write("|");
                    writer.writeNode(Type.null());
                }
                break;
            }
            case "reference":
                if (comment) {
                    writer.writeNode(this.internalType.value);
                    const generics = this.internalType.value.generics;

                    if (generics && generics.length > 0) {
                        writer.write("<");
                        generics.forEach((generic, index) => {
                            if (index > 0) {
                                writer.write(", ");
                            }
                            generic.write(writer, { comment });
                        });
                        writer.write(">");
                    }
                } else {
                    writer.writeNode(this.internalType.value);
                }
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
            case "literal":
                if (comment) {
                    writer.writeNode(this.internalType.value);
                } else {
                    switch (this.internalType.value.internalType.type) {
                        case "string":
                            writer.write("string");
                            break;
                        case "boolean":
                            writer.write("bool");
                            break;
                        default:
                            assertNever(this.internalType.value.internalType);
                    }
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

    public getClassReference(): ClassReference {
        switch (this.internalType.type) {
            case "date":
            case "dateTime":
                return new ClassReference({
                    name: "DateTime",
                    namespace: GLOBAL_NAMESPACE
                });

            case "enumString":
            case "reference":
                return this.internalType.value;

            case "int":
            case "string":
            case "bool":
            case "float":
            case "object":
            case "map":
            case "array":
            case "null":
            case "mixed":
            case "optional":
            case "typeDict":
            case "union":
            case "literal":
                throw new Error("Cannot get class reference for " + this.internalType.type);
            default:
                assertNever(this.internalType);
        }
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
        // Recursively flatten nested unions and deduplicate
        const flattenedTypes = this.flattenUnionTypes(types);

        // Deduplicate types to avoid duplicates like array|array
        const uniqueTypes = uniqWith(flattenedTypes, isEqual);

        return new this({
            type: "union",
            types: uniqueTypes
        });
    }

    private static flattenUnionTypes(types: Type[]): Type[] {
        const flattened: Type[] = [];

        for (const type of types) {
            if (type.internalType.type === "union") {
                // Recursively flatten nested unions
                flattened.push(...this.flattenUnionTypes(type.internalType.types));
            } else {
                flattened.push(type);
            }
        }

        return flattened;
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

    public static null(): Type {
        return new this({
            type: "null"
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

    public static literalString(value: string): Type {
        return new this({
            type: "literal",
            value: TypeLiteral.string(value) as LiteralString
        });
    }

    public static literalBoolean(value: boolean): Type {
        return new this({
            type: "literal",
            value: TypeLiteral.boolean(value) as LiteralBoolean
        });
    }

    private static isAlreadyOptional(value: Type) {
        return value.internalType.type === "optional";
    }

    private writeUnion({
        writer,
        unionTypes,
        comment
    }: {
        writer: Writer;
        unionTypes: Type[];
        comment: boolean | undefined;
    }): void {
        const uniqueTypes = this.getUniqueTypes({ types: unionTypes, comment, writer });
        const types = this.unwrapOptionalTypes(uniqueTypes);

        const hasMixed = types.filter((type) => type.underlyingType().internalType.type === "mixed").length > 0;
        if (hasMixed && !comment) {
            writer.write("mixed");
            return;
        }

        if (types.length > 0 && comment) {
            writer.writeLine("(");
            types.forEach((type, index) => {
                if (index > 0) {
                    writer.write(" *   |");
                } else {
                    writer.write(" *    ");
                }
                if (hasMixed) {
                    type = type.underlyingType();
                }
                type.write(writer, { comment });
                writer.writeLine();
                index++;
            });
            writer.write(" * )");
            return;
        }

        types.forEach((type, index) => {
            if (index > 0) {
                writer.write("|");
            }
            if (hasMixed) {
                type = type.underlyingType();
            }
            type.write(writer, { comment });
            index++;
        });
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
        // First, do semantic deduplication using lodash isEqual
        const semanticallyUnique = uniqWith(types, isEqual);

        // Then, do string-based deduplication for cases where different semantic types
        // render to the same string (e.g., array<string,mixed> and array<Recipient> both become "array")
        const typeStrings = new Set();
        return semanticallyUnique.filter((type) => {
            const typeString = type.toString({
                namespace: writer.namespace,
                rootNamespace: writer.rootNamespace,
                customConfig: writer.customConfig,
                comment
            });

            // Handle potential duplicates, such as strings (due to enums) and arrays.
            if (typeStrings.has(typeString)) {
                return false;
            }
            typeStrings.add(typeString);
            return true;
        });
    }

    /**
     * Unwraps optional types and adds the 'null' type if there are any optional types.
     */
    private unwrapOptionalTypes(types: Type[]): Type[] {
        let hasOptional = false;
        const result = types.map((type) => {
            if (type.internalType.type === "optional") {
                hasOptional = true;
                return type.internalType.value;
            }
            return type;
        });
        if (hasOptional) {
            result.push(Type.null());
        }
        return result;
    }

    /**
     * Determines if the union has one or more optional types.
     */
    private unionHasOptional(types: Type[]): boolean {
        return types.filter((type) => type.internalType.type === "optional").length > 0;
    }

    /**
     * Writes the type to a string.
     */
    public toString({
        namespace,
        rootNamespace,
        customConfig,
        comment
    }: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
        comment?: boolean;
    }): string {
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer, { comment: comment ?? false });
        return writer.toString();
    }
}

export const DateTimeClassReference = new ClassReference({
    namespace: GLOBAL_NAMESPACE,
    name: "DateTime"
});
