import { type Generation } from "../../context/generation-info";
import { is } from "../../utils/type-guards";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "../types/ClassReference";
import { Type } from "../types/Type";

/**
 * Represents a field in a class constructor initialization.
 */
export interface ConstructorField {
    /**
     * The name of the field.
     */
    name: string;

    /**
     * The literal value to assign to the field.
     */
    value: Literal;
}

/**
 * Represents a key-value pair in a dictionary literal.
 */
export interface DictionaryEntry {
    /**
     * The key of the dictionary entry.
     */
    key: Literal;

    /**
     * The value of the dictionary entry.
     */
    value: Literal;
}

/**
 * Base class for all C# literal value representations in the AST.
 *
 * Literals represent concrete values that can be written directly into code,
 * such as numbers (42, 3.14), strings ("hello"), booleans (true), collections ([1, 2, 3]),
 * and object initializers. Each subclass knows how to render its specific literal type
 * using the appropriate C# syntax.
 */
export abstract class Literal extends AstNode {
    /**
     * Writes this literal value to the provided writer using appropriate C# syntax.
     */
    public abstract override write(writer: Writer): void;

    /**
     * Gets the name of this literal type, typically the constructor name.
     * Used primarily for debugging and type identification.
     */
    public get typeName(): string {
        return this.constructor.name;
    }
}

// Namespace for all Literal classes
export namespace Literal {
    /**
     * Represents a boolean literal value in C# (true or false).
     */
    export class Boolean extends Literal {
        /**
         * The boolean value.
         */
        public readonly value: boolean;

        /**
         * Creates a new boolean literal.
         * @param value - The boolean value (true or false)
         * @param generation - The generation context for code generation
         */
        constructor(value: boolean, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(this.value.toString());
        }
    }

    /**
     * Represents a class instantiation literal with constructor arguments.
     * This generates code like `new ClassName(field1: value1, field2: value2)`.
     */
    export class Class_ extends Literal {
        /**
         * The fields to initialize in the constructor.
         */
        public readonly fields: ConstructorField[];

        /**
         * The class reference being instantiated.
         */
        public readonly reference: ClassReference;

        /**
         * Creates a new class instantiation literal.
         * @param reference - The class reference to instantiate
         * @param fields - The fields to initialize with their values
         * @param generation - The generation context for code generation
         */
        constructor(reference: ClassReference, fields: ConstructorField[], generation: Generation) {
            super(generation);
            this.reference = reference;
            this.fields = fields;
        }

        public write(writer: Writer): void {
            const fields = this.fields.filter((field) => !(field.value instanceof Literal.Nop));
            writer.writeNode(
                this.reference.new({
                    arguments_: fields.map((field) => ({ name: field.name, assignment: field.value })),
                    multiline: true
                })
            );
        }
    }

    /**
     * Represents a DateOnly literal in C# (date without time component).
     * This generates code like `DateOnly.Parse("2023-01-15")`.
     */
    export class Date extends Literal {
        /**
         * The date string in a parseable format.
         */
        public readonly value: string;

        /**
         * Creates a new DateOnly literal.
         * @param value - The date string (e.g., "2023-01-15")
         * @param generation - The generation context for code generation
         */
        constructor(value: string, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(this.System.DateOnly, `.Parse("${this.value}")`);
        }
    }

    /**
     * Represents a DateTime literal in C# with timezone adjustment.
     * This generates code like `DateTime.Parse("...", null, DateTimeStyles.AdjustToUniversal)`.
     */
    export class DateTime extends Literal {
        /**
         * The datetime string in a parseable format.
         */
        public readonly value: string;

        /**
         * Creates a new DateTime literal.
         * @param value - The datetime string (e.g., "2023-01-15T10:30:00Z")
         * @param generation - The generation context for code generation
         */
        constructor(value: string, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(
                this.System.DateTime,
                `.Parse("${this.value}", null, `,
                this.System.Globalization.DateTimeStyles,
                ".AdjustToUniversal)"
            );
        }
    }

    /**
     * Represents a decimal literal in C# (high-precision decimal number).
     * This generates code like `42.5m` (the 'm' suffix denotes decimal type).
     */
    export class Decimal extends Literal {
        /**
         * The decimal value.
         */
        public readonly value: number;

        /**
         * Creates a new decimal literal.
         * @param value - The decimal value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(`${this.value}m`);
        }
    }

    /**
     * Represents a double literal in C# (64-bit floating-point number).
     * This generates code like `3.14` (no suffix needed for double).
     */
    export class Double extends Literal {
        /**
         * The double value.
         */
        public readonly value: number;

        /**
         * Creates a new double literal.
         * @param value - The double value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(this.value.toString());
        }
    }

    /**
     * Represents a float literal in C# (32-bit floating-point number).
     * This generates code like `3.14f` (the 'f' suffix denotes float type).
     */
    export class Float extends Literal {
        /**
         * The float value.
         */
        public readonly value: number;

        /**
         * Creates a new float literal.
         * @param value - The float value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(`${this.value}f`);
        }
    }

    /**
     * Represents an integer literal in C# (32-bit signed integer).
     * This generates code like `42` (no suffix needed for int).
     */
    export class Integer extends Literal {
        /**
         * The integer value.
         */
        public readonly value: number;

        /**
         * Creates a new integer literal.
         * @param value - The integer value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(this.value.toString());
        }
    }

    /**
     * Represents a long literal in C# (64-bit signed integer).
     * This generates code like `42L` (the 'L' suffix denotes long type).
     */
    export class Long extends Literal {
        /**
         * The long value.
         */
        public readonly value: number;

        /**
         * Creates a new long literal.
         * @param value - The long value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(`${this.value}L`);
        }
    }

    /**
     * Represents an unsigned integer literal in C# (32-bit unsigned integer).
     * This generates code like `42u` (the 'u' suffix denotes unsigned int).
     */
    export class Uint extends Literal {
        /**
         * The unsigned integer value.
         */
        public readonly value: number;

        /**
         * Creates a new unsigned integer literal.
         * @param value - The unsigned integer value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(`${this.value}u`);
        }
    }

    /**
     * Represents an unsigned long literal in C# (64-bit unsigned integer).
     * This generates code like `42ul` (the 'ul' suffix denotes unsigned long).
     */
    export class Ulong extends Literal {
        /**
         * The unsigned long value.
         */
        public readonly value: number;

        /**
         * Creates a new unsigned long literal.
         * @param value - The unsigned long value
         * @param generation - The generation context for code generation
         */
        constructor(value: number, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.write(`${this.value}ul`);
        }
    }

    /**
     * Represents a reference to another AST node as a literal value.
     * This allows embedding arbitrary AST nodes within literal contexts.
     */
    export class Reference extends Literal {
        /**
         * The AST node being referenced.
         */
        public readonly value: AstNode;

        /**
         * Creates a new reference literal.
         * @param value - The AST node to reference
         * @param generation - The generation context for code generation
         */
        constructor(value: AstNode, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.writeNode(this.value);
        }
    }

    /**
     * Represents a string literal in C# with proper escaping.
     * This generates code like `"hello world"` with appropriate character escaping.
     */
    export class String extends Literal {
        /**
         * The string value.
         */
        public readonly value: string;

        /**
         * Creates a new string literal.
         * @param value - The string value
         * @param generation - The generation context for code generation
         */
        constructor(value: string, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            writer.writeNode(this.csharp.string_({ string: this.value }));
        }
    }

    /**
     * Represents a null literal in C#.
     * This generates the code `null`.
     */
    export class Null extends Literal {
        public write(writer: Writer): void {
            writer.write("null");
        }
    }

    /**
     * Represents a no-operation literal that writes nothing.
     * This is useful for filtering out optional values or placeholder fields.
     */
    export class Nop extends Literal {
        public write(writer: Writer): void {
            // No-op: writes nothing
        }
    }

    /**
     * Represents a List<T> collection initializer literal in C#.
     * This generates code like `new List<int>() { 1, 2, 3 }`.
     */
    export class List extends Literal {
        /**
         * The element type of the list.
         */
        public readonly valueType: Type;

        /**
         * The literal values to include in the list.
         */
        public readonly values: Literal[];

        /**
         * Creates a new List literal.
         * @param valueType - The type of elements in the list
         * @param values - The literal values to initialize the list with
         * @param generation - The generation context for code generation
         */
        constructor(valueType: Type, values: Literal[], generation: Generation) {
            super(generation);
            this.valueType = valueType;
            this.values = values;
        }

        public write(writer: Writer): void {
            writer.write(this.System.Collections.Generic.List(this.valueType).new());

            if (this.values.length === 0) {
                return;
            }

            writer.pushScope();
            for (const value of this.values.filter((value) => !(value instanceof Literal.Nop))) {
                value.write(writer);
                writer.writeLine(",");
            }
            writer.popScope();
        }
    }

    /**
     * Represents a HashSet<T> collection initializer literal in C#.
     * This generates code like `new HashSet<int>() { 1, 2, 3 }`.
     */
    export class Set extends Literal {
        /**
         * The element type of the set.
         */
        public readonly valueType: Type;

        /**
         * The literal values to include in the set.
         */
        public readonly values: Literal[];

        /**
         * Creates a new HashSet literal.
         * @param valueType - The type of elements in the set
         * @param values - The literal values to initialize the set with
         * @param generation - The generation context for code generation
         */
        constructor(valueType: Type, values: Literal[], generation: Generation) {
            super(generation);
            this.valueType = valueType;
            this.values = values;
        }

        public write(writer: Writer): void {
            writer.write(this.System.Collections.Generic.HashSet(this.valueType).new());

            if (this.values.length === 0) {
                return;
            }

            writer.pushScope();
            for (const value of this.values.filter((value) => !(value instanceof Literal.Nop))) {
                value.write(writer);
                writer.writeLine(",");
            }
            writer.popScope();
        }
    }

    /**
     * Represents a Dictionary<TKey, TValue> collection initializer literal in C#.
     * This generates code like `new Dictionary<string, int>() { ["key1"] = 1, ["key2"] = 2 }`.
     */
    export class Dictionary extends Literal {
        /**
         * The entries to include in the dictionary.
         */
        public readonly entries: DictionaryEntry[];

        /**
         * The key type of the dictionary.
         */
        public readonly keyType: Type;

        /**
         * The value type of the dictionary.
         */
        public readonly valueType: Type;

        /**
         * Creates a new Dictionary literal.
         * @param keyType - The type of keys in the dictionary
         * @param valueType - The type of values in the dictionary
         * @param entries - The key-value pairs to initialize the dictionary with
         * @param generation - The generation context for code generation
         */
        constructor(keyType: Type, valueType: Type, entries: DictionaryEntry[], generation: Generation) {
            super(generation);
            this.keyType = keyType;
            this.valueType = valueType;
            this.entries = entries;
        }

        public write(writer: Writer): void {
            writer.write(this.System.Collections.Generic.Dictionary(this.keyType, this.valueType).new());

            const entries = this.entries.filter((entry) => !is.Literal.nop(entry.key) && !is.Literal.nop(entry.value));
            if (entries.length === 0) {
                return;
            }

            writer.pushScope();

            for (const entry of entries) {
                writer.write("[");
                writer.writeNode(entry.key);
                writer.write("] = ");
                writer.writeNode(entry.value);
                writer.writeLine(",");
            }
            writer.popScope();
        }
    }

    /**
     * Represents a literal for unknown/dynamic values that are determined at runtime.
     * This recursively converts JavaScript values (primitives, objects, arrays) into appropriate C# literal syntax.
     *
     * For example, a JavaScript object `{ name: "Alice", age: 30 }` becomes
     * `new Dictionary<string, object>() { ["name"] = "Alice", ["age"] = 30 }`.
     */
    export class Unknown extends Literal {
        /**
         * The unknown value to convert to C# syntax.
         */
        public readonly value: unknown;

        /**
         * Creates a new Unknown literal.
         * @param value - The unknown value (can be primitive, object, or array)
         * @param generation - The generation context for code generation
         */
        constructor(value: unknown, generation: Generation) {
            super(generation);
            this.value = value;
        }

        public write(writer: Writer): void {
            this.writeUnknown({ writer, value: this.value });
        }

        /**
         * Recursively writes an unknown value using appropriate C# syntax.
         * @param params - Object containing the writer and value
         * @param params.writer - The writer to output to
         * @param params.value - The value to write
         */
        private writeUnknown({ writer, value }: { writer: Writer; value: unknown }): void {
            switch (typeof value) {
                case "boolean":
                    writer.write(value.toString());
                    return;
                case "string":
                    writer.writeNode(this.csharp.string_({ string: value }));
                    return;
                case "number":
                    writer.write(value.toString());
                    return;
                case "object":
                    if (value == null) {
                        writer.write("null");
                        return;
                    }
                    if (Array.isArray(value)) {
                        this.writeUnknownArray({ writer, value });
                        return;
                    }
                    this.writeUnknownMap({ writer, value });
                    return;
                default:
                    throw new Error(`Internal error; unsupported unknown type: ${typeof value}`);
            }
        }

        /**
         * Writes an unknown array as a List<object> literal.
         * @param params - Object containing the writer and array value
         * @param params.writer - The writer to output to
         * @param params.value - The array to write
         */
        private writeUnknownArray({
            writer,
            value
        }: {
            writer: Writer;
            // biome-ignore lint/suspicious/noExplicitAny: allow
            value: any[];
        }): void {
            writer.write(this.System.Collections.Generic.List(this.Primitive.object).new());
            if (value.length === 0) {
                return;
            }
            writer.writeLine();
            writer.pushScope();
            for (const element of value) {
                writer.writeNode(new Unknown(element, this.generation));
                writer.writeLine(",");
            }
            writer.popScope();
        }

        /**
         * Writes an unknown object as a Dictionary<string, object> literal.
         * @param params - Object containing the writer and object value
         * @param params.writer - The writer to output to
         * @param params.value - The object to write
         */
        private writeUnknownMap({ writer, value }: { writer: Writer; value: object }): void {
            const entries = Object.entries(value);
            writer.write(
                this.System.Collections.Generic.Dictionary(this.Primitive.string, this.Primitive.object).new()
            );
            if (entries.length === 0) {
                return;
            }
            writer.writeLine();
            writer.pushScope();
            for (const [key, val] of entries) {
                writer.write(`["${key}"] = `);
                writer.writeNode(new Unknown(val, this.generation));
                writer.writeLine(",");
            }
            writer.popScope();
        }
    }
}
