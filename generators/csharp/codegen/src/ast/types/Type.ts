import { fail } from "node:assert";
import { PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";
import { type Generation } from "../../context/generation-info";
import { hash, uniqueId } from "../../utils/text";
import { Literal } from "../code/Literal";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
import { type Type } from "./IType";

/**
 * Base class for all C# type representations in the AST.
 *
 * This class provides a polymorphic type system that makes it easier to work with
 * different C# types without requiring switch statements on discriminated unions.
 * Each concrete type (Integer, String, List, etc.) extends this base class and
 * provides its own implementation of abstract members.
 */
export abstract class BaseType extends AstNode {
    /**
     * Gets the multipart form method name used when this type is added to a multipart/form-data request.
     * For example, primitives use "AddStringPart", while objects use "AddJsonPart".
     */
    public abstract get multipartMethodName(): string | null;

    /**
     * Gets the multipart form method name used when a collection of this type is added to a multipart/form-data request.
     * For example, primitives use "AddStringParts", while objects use "AddJsonParts".
     */
    public abstract get multipartMethodNameForCollection(): string | null;

    /**
     * The default value for this type (e.g., null for reference types, 0 for integers, etc.).
     */
    public readonly defaultValue: Literal = this.csharp.Literal.null();

    /**
     * Indicates whether this type is optional (nullable). Defaults to false.
     */
    public readonly isOptional: boolean = false;

    /**
     * Indicates whether this type is a reference type (true), value type (false), or indeterminate (undefined).
     * Reference types include classes, interfaces, strings, etc. Value types include structs, primitives, etc.
     */
    public readonly isReferenceType: boolean | undefined = false;

    /**
     * The string representation of this type, typically the constructor name.
     * Used primarily for debugging and default write implementations.
     */
    public readonly fullyQualifiedName: string = this.constructor.name;

    /**
     * Indicates whether this type represents an async enumerable (IAsyncEnumerable<T>).
     */
    public get isAsyncEnumerable(): boolean {
        return false;
    }

    /**
     * Indicates whether this type represents a collection (List, Set, Map, etc.).
     */
    public get isCollection(): boolean {
        return false;
    }

    /**
     * Gets the item type for collection types (e.g., T in List<T>, or KeyValuePair<K,V> in Map<K,V>).
     * Returns undefined for non-collection types.
     */
    public getCollectionItemType(): Type | undefined {
        return undefined;
    }

    /**
     * Wraps this type in an Optional type if it's not already optional.
     * If this type is already optional, returns it unchanged.
     */
    public asOptional(): Type {
        return new Optional(this, this.generation);
    }

    /**
     * Returns the underlying type if this is an Optional type, otherwise returns this type unchanged.
     * This is useful for getting the non-nullable version of a type.
     */
    public asNonOptional(): Type {
        return this;
    }

    /**
     * Writes this type to the provided writer.
     * The default implementation writes the type name, but most subclasses override this
     * to provide more specific C# type syntax.
     */
    public override write(writer: Writer): void {
        writer.write(this.fullyQualifiedName);
    }

    /**
     * Writes an empty collection initializer for this type (e.g., "= new List<T>();").
     * The default implementation is a no-op. Collection types override this to provide
     * appropriate initialization syntax.
     */
    public writeEmptyCollectionInitializer(writer: Writer): void {
        // default - no-op
    }

    /**
     * This returns a typeLiteral for the appropriate type with a value,
     * derived from the getDefaultFor string
     *
     * The value should give a deterministic result for the same input string.
     * This is used to generate a default value for a type when no value is provided.
     *
     * @param input - The input string to derive the default value from
     * @returns A typeLiteral for the appropriate type with a value, derived from the input string
     * */
    public getDeterminsticDefault(input: string): Literal {
        return this.csharp.Literal.nop();
    }
}

/**
 * Base class for all primitive types in C# (int, string, bool, double, etc.).
 * Primitive types are serialized as strings in multipart form data.
 */
abstract class PrimitiveType extends BaseType {
    public override get multipartMethodName(): string | null {
        return "AddStringPart";
    }

    public override get multipartMethodNameForCollection(): string | null {
        return "AddStringParts";
    }
}

/**
 * Base class for types that are always reference types but don't fit into CollectionType or ObjectType categories.
 * This includes delegates (Action, Func), optional types, union types, and special types like Binary and SystemType.
 */
abstract class ReferenceType extends BaseType {
    public override readonly isReferenceType: boolean | undefined = true;
}

/**
 * Base class for all collection types in C# (List, Set, Map, etc.).
 * Collection types are serialized as JSON in multipart form data and are always reference types.
 */
abstract class CollectionType extends ReferenceType {
    public override get isCollection(): boolean {
        return true;
    }

    public override get multipartMethodName(): string | null {
        return "AddJsonPart";
    }

    public override get multipartMethodNameForCollection(): string | null {
        return "AddJsonParts";
    }
}

/**
 * Base class for all object/reference types in C# (classes, interfaces, etc.).
 * Object types are serialized as JSON in multipart form data and are always reference types.
 */
abstract class ObjectType extends ReferenceType {
    public override get multipartMethodName(): string | null {
        return "AddJsonPart";
    }

    public override get multipartMethodNameForCollection(): string | null {
        return "AddJsonParts";
    }
}

/**
 * Represents an optional (nullable) type in C#.
 * For value types, this renders as T?, and for reference types, it also uses the nullable syntax.
 */
export class Optional extends ReferenceType {
    public override readonly isOptional = true;

    /**
     * The underlying non-nullable type.
     */
    public readonly value: Type;

    /**
     * Creates a new optional type.
     * @param value - The underlying non-nullable type
     * @param generation - The generation context for code generation
     */
    constructor(value: Type, generation: Generation) {
        super(generation);
        this.value = value;
    }

    public override get isCollection(): boolean {
        return false;
    }

    public override get multipartMethodName(): string | null {
        return this.value.multipartMethodName;
    }

    public override get multipartMethodNameForCollection(): string | null {
        return this.value.multipartMethodNameForCollection;
    }

    public override asOptional(): Type {
        return this;
    }

    public override asNonOptional(): Type {
        return this.value;
    }

    public override write(writer: Writer): void {
        this.value.write(writer);
        if (!this.value.isOptional) {
            writer.write("?");
        }
    }
}

export namespace Primitive {
    /**
     * Represents the C# `int` type (32-bit signed integer).
     */
    export class Integer extends PrimitiveType {
        public override fullyQualifiedName = "int";
        public override defaultValue = this.csharp.Literal.integer(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique number using the defualtWith string as the seed.
            return this.csharp.Literal.integer(hash(input) & 0x7fffffff);
        }
    }

    /**
     * Represents the C# `long` type (64-bit signed integer).
     */
    export class Long extends PrimitiveType {
        public override fullyQualifiedName = "long";
        public override defaultValue = this.csharp.Literal.long(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique number using the defualtWith string as the seed.
            return this.csharp.Literal.long(hash(input) & 0x7ffffffffffff);
        }
    }

    /**
     * Represents the C# `uint` type (32-bit unsigned integer).
     */
    export class Uint extends PrimitiveType {
        public override fullyQualifiedName = "uint";
        public override defaultValue = this.csharp.Literal.uint(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique number using the defualtWith string as the seed.
            return this.csharp.Literal.uint(hash(input) & 0x7fffffff);
        }
    }

    /**
     * Represents the C# `ulong` type (64-bit unsigned integer).
     */
    export class ULong extends PrimitiveType {
        public override fullyQualifiedName = "ulong";
        public override defaultValue = this.csharp.Literal.ulong(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique number using the defualtWith string as the seed.
            return this.csharp.Literal.ulong(hash(input) & 0x7ffffffffffff);
        }
    }

    /**
     * Represents the C# `string` type.
     * Strings are reference types in C#.
     */
    export class String extends PrimitiveType {
        public override fullyQualifiedName = "string";
        public override defaultValue = this.csharp.Literal.string("");
        public override readonly isReferenceType: boolean | undefined = true;
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique string using the defualtWith string as the seed.
            return this.csharp.Literal.string(`<${input}>`);
        }
    }

    /**
     * Represents the C# `bool` type.
     */
    export class Boolean extends PrimitiveType {
        public override fullyQualifiedName = "bool";
        public override defaultValue = this.csharp.Literal.boolean(false);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique boolean using the defualtWith string as the seed.
            return this.csharp.Literal.boolean(hash(input) % 2 === 0);
        }
    }

    /**
     * Represents the C# `float` type (32-bit floating-point number).
     */
    export class Float extends PrimitiveType {
        public override fullyQualifiedName = "float";
        public override defaultValue = this.csharp.Literal.float(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique float using the defualtWith string as the seed.
            return this.csharp.Literal.float((hash(input) & 0x7fffffff) / 100);
        }
    }

    /**
     * Represents the C# `double` type (64-bit floating-point number).
     */
    export class Double extends PrimitiveType {
        public override fullyQualifiedName = "double";
        public override defaultValue = this.csharp.Literal.double(0);
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique double using the defualtWith string as the seed.
            return this.csharp.Literal.double((hash(input) & 0x7ffffffffffff) / 100);
        }
    }

    /**
     * Represents the C# `object` type (base type for all reference types).
     */
    export class Object extends ObjectType {
        public override fullyQualifiedName = "object";
    }

    export class AribitraryType extends PrimitiveType {
        constructor(
            public override readonly fullyQualifiedName: string,
            generation: Generation
        ) {
            super(generation);
        }
    }
}

export namespace Value {
    /**
     * Represents the C# `byte[]` type (byte array/binary data).
     * This type is used for binary data.
     */
    export class Binary extends ReferenceType {
        public override get multipartMethodName(): string | null {
            fail("byte[] can not be added to multipart form");
            return "";
        }

        public override get multipartMethodNameForCollection(): string {
            fail("byte[] can not be added to multipart form");
            return "";
        }

        public override write(writer: Writer): void {
            writer.write("byte[]");
        }
    }
    /**
     * Represents the C# `DateOnly` type (date without time component).
     */
    export class DateOnly extends PrimitiveType {
        public override fullyQualifiedName = "DateOnly";
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique date using the defualtWith string as the seed.
            const date = new Date(hash(input) & 0x7ffffffffffff);
            return this.csharp.Literal.date(date.toISOString());
        }
    }

    /**
     * Represents the C# `DateTime` type.
     */
    export class DateTime extends PrimitiveType {
        public override fullyQualifiedName = "DateTime";
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique date using the defualtWith string as the seed.
            const date = new Date(hash(input) & 0x7ffffffffffff);
            return this.csharp.Literal.datetime(date.toISOString());
        }
    }
    /**
     * Represents a UUID type, which is represented as a C# `string`.
     * Note: C# GUID is a value type, but we use string for UUID compatibility.
     */
    export class Uuid extends PrimitiveType {
        public override fullyQualifiedName = "string";
        public override defaultValue = this.csharp.Literal.string("");

        // C# GUID is a value type, but we use string for UUID
        public override readonly isReferenceType: boolean | undefined = true;
        public override getDeterminsticDefault(input: string): Literal {
            // make a unique UUID using the defualtWith string as the seed.
            return this.csharp.Literal.string(uniqueId(input));
        }
    }

    /**
     * Represents a string enum type (enum backed by string values).
     * This extends PrimitiveType because string enums are serialized as strings.
     */
    export class StringEnum extends PrimitiveType {
        /**
         * The class reference for the string enum type.
         */
        public readonly value: ClassReference;

        /**
         * Creates a new string enum type.
         * @param value - The class reference for the enum
         * @param generation - The generation context for code generation
         */
        constructor(value: ClassReference, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public override write(writer: Writer): void {
            this.Types.StringEnum(this.value).write(writer);
        }
    }
}

export namespace Collection {
    /**
     * Represents a C# array type (T[]).
     * Arrays can be rendered as ReadOnlyMemory<T> for certain primitive types when configured.
     */
    export class Array extends ObjectType {
        public override readonly isReferenceType: boolean | undefined = true;

        /**
         * The element type of the array.
         */
        public readonly value: Type;

        /**
         * Creates a new array type.
         * @param value - The element type of the array
         * @param generation - The generation context for code generation
         */
        constructor(value: Type, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            this.value.write(writer);
            writer.write("[]");
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.System.ReadOnlyMemory(value));
        }
    }

    /**
     * Represents the concrete C# `List<T>` type.
     * Can be rendered as ReadOnlyMemory<T> for certain primitive types when configured.
     */
    export class ListType extends CollectionType {
        /**
         * The element type of the list.
         */
        public readonly value: Type;

        /**
         * Creates a new List<T> type.
         * @param value - The element type of the list
         * @param generation - The generation context for code generation
         */
        constructor(value: Type, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public override get multipartMethodName(): string | null {
            return this.value.multipartMethodNameForCollection;
        }

        public override get multipartMethodNameForCollection(): string | null {
            return this.value.multipartMethodNameForCollection;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            writer.writeNode(this.System.Collections.Generic.List(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                return;
            }
            writer.writeStatement(" = ", this.System.Collections.Generic.List(this.value).new());
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.System.ReadOnlyMemory(value));
        }
    }

    /**
     * Represents the C# `IEnumerable<T>` interface type.
     * Can be rendered as ReadOnlyMemory<T> for certain primitive types when configured.
     */
    export class List extends CollectionType {
        /**
         * The element type of the enumerable.
         */
        public readonly value: Type;

        /**
         * Creates a new IEnumerable<T> type.
         * @param value - The element type of the enumerable
         * @param generation - The generation context for code generation
         */
        constructor(value: Type, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public override get multipartMethodName(): string | null {
            return this.value.multipartMethodNameForCollection;
        }

        public override get multipartMethodNameForCollection(): string | null {
            return this.value.multipartMethodNameForCollection;
        }

        public override getCollectionItemType(): Type {
            return this.value;
        }

        public override write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            writer.writeNode(this.System.Collections.Generic.IEnumerable(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                return;
            }
            writer.writeStatement(" = ", this.System.Collections.Generic.List(this.value).new());
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.System.ReadOnlyMemory(value));
        }
    }

    /**
     * Represents the C# `HashSet<T>` type.
     */
    export class Set extends CollectionType {
        /**
         * The element type of the set.
         */
        public readonly value: Type;

        /**
         * Creates a new HashSet<T> type.
         * @param value - The element type of the set
         * @param generation - The generation context for code generation
         */
        constructor(value: Type, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override write(writer: Writer): void {
            writer.writeNode(this.System.Collections.Generic.HashSet(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            writer.writeStatement(" = ", this.System.Collections.Generic.HashSet(this.value).new());
        }
    }

    /**
     * Represents the concrete C# `Dictionary<TKey, TValue>` type.
     * Can optionally simplify Dictionary<string, object?> to just `object` based on settings.
     */
    export class Map extends CollectionType {
        /**
         * The key type of the dictionary.
         */
        public readonly keyType: Type;

        /**
         * Optional configuration for this map type.
         */
        public readonly options?: { dontSimplify?: boolean };

        /**
         * The value type of the dictionary.
         */
        public readonly valueType: Type;

        /**
         * Creates a new Dictionary<TKey, TValue> type.
         * @param keyType - The key type of the dictionary
         * @param valueType - The value type of the dictionary
         * @param generation - The generation context for code generation
         * @param options - Optional configuration (e.g., whether to skip simplification)
         */
        constructor(keyType: Type, valueType: Type, generation: Generation, options?: { dontSimplify?: boolean }) {
            super(generation);
            this.keyType = keyType;
            this.valueType = valueType;
            this.options = options;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.Collection.keyValuePair(this.keyType, this.valueType);
        }

        public override write(writer: Writer): void {
            if (
                this.options?.dontSimplify !== true &&
                writer.generation.settings.simplifyObjectDictionaries &&
                this.keyType instanceof Primitive.String &&
                this.valueType instanceof Optional &&
                this.valueType.value instanceof Primitive.Object
            ) {
                writer.write("object");
                return;
            }
            writer.write(this.System.Collections.Generic.Dictionary(this.keyType, this.valueType));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            writer.writeStatement(
                " = ",
                this.System.Collections.Generic.Dictionary(this.keyType, this.valueType).new()
            );
        }
    }

    /**
     * Represents the C# `IDictionary<TKey, TValue>` interface type.
     * Can optionally simplify IDictionary<string, object?> to just `object` based on settings.
     */
    export class IDictionary extends CollectionType {
        /**
         * The key type of the dictionary.
         */
        public readonly keyType: Type;

        /**
         * Optional configuration for this dictionary type.
         */
        public readonly options?: { dontSimplify?: boolean };

        /**
         * The value type of the dictionary.
         */
        public readonly valueType: Type;

        /**
         * Creates a new IDictionary<TKey, TValue> type.
         * @param keyType - The key type of the dictionary
         * @param valueType - The value type of the dictionary
         * @param generation - The generation context for code generation
         * @param options - Optional configuration (e.g., whether to skip simplification)
         */
        constructor(keyType: Type, valueType: Type, generation: Generation, options?: { dontSimplify?: boolean }) {
            super(generation);
            this.keyType = keyType;
            this.valueType = valueType;
            this.options = options;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.Collection.keyValuePair(this.keyType, this.valueType);
        }

        public override write(writer: Writer): void {
            if (
                this.options?.dontSimplify !== true &&
                writer.generation.settings.simplifyObjectDictionaries &&
                this.keyType instanceof Primitive.String &&
                this.valueType instanceof Optional &&
                this.valueType.value instanceof Primitive.Object
            ) {
                writer.write("object");
                return;
            }
            writer.writeNode(this.System.Collections.Generic.IDictionary(this.keyType, this.valueType));
        }
    }

    /**
     * Represents the C# `KeyValuePair<TKey, TValue>` struct type.
     * This is a value type (struct) in C#, not a reference type.
     */
    export class KeyValuePair extends ObjectType {
        public override readonly isReferenceType: boolean | undefined = false;

        /**
         * The key type of the key-value pair.
         */
        public readonly keyType: Type;

        /**
         * The value type of the key-value pair.
         */
        public readonly valueType: Type;

        /**
         * Creates a new KeyValuePair<TKey, TValue> type.
         * @param keyType - The key type
         * @param valueType - The value type
         * @param generation - The generation context for code generation
         */
        constructor(keyType: Type, valueType: Type, generation: Generation) {
            super(generation);
            this.keyType = keyType;
            this.valueType = valueType;
        }

        public override write(writer: Writer): void {
            writer.writeNode(this.System.Collections.Generic.KeyValuePair(this.keyType, this.valueType));
        }
    }
}

/**
 * Converts an array of C# type names to their corresponding PrimitiveTypeV1 enum values.
 * This is used for converting ReadOnlyMemory type configurations.
 *
 * @param readOnlyMemoryTypeNames - Array of C# type names (e.g., "int", "string", "bool")
 * @returns Array of PrimitiveTypeV1 enum values
 * @throws Error if an unknown type name is encountered (should be unreachable if validated earlier)
 */
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
            case "boolean":
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

/**
 * Determines whether a given type should be rendered as `ReadOnlyMemory<T>` instead of an array or list.
 * This check is recursive for Optional types and delegates to the writer's configuration for the actual check.
 *
 * @param params - Object containing the writer and type to check
 * @param params.writer - The writer instance containing configuration for ReadOnlyMemory types
 * @param params.value - The type to check
 * @returns true if the type should be rendered as ReadOnlyMemory, false otherwise
 */
function isReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): boolean {
    if (value instanceof Optional) {
        return isReadOnlyMemoryType({ writer, value: value.value });
    }
    // Check if it's a primitive type that should be ReadOnlyMemory
    if (value instanceof Primitive.Integer) {
        return writer.isReadOnlyMemoryType("int");
    }
    if (value instanceof Primitive.Long) {
        return writer.isReadOnlyMemoryType("long");
    }
    if (value instanceof Primitive.Uint) {
        return writer.isReadOnlyMemoryType("uint");
    }
    if (value instanceof Primitive.ULong) {
        return writer.isReadOnlyMemoryType("ulong");
    }
    if (value instanceof Primitive.String) {
        return writer.isReadOnlyMemoryType("string");
    }
    if (value instanceof Primitive.Boolean) {
        return writer.isReadOnlyMemoryType("bool");
    }
    if (value instanceof Primitive.Float) {
        return writer.isReadOnlyMemoryType("float");
    }
    if (value instanceof Primitive.Double) {
        return writer.isReadOnlyMemoryType("double");
    }
    return false;
}
