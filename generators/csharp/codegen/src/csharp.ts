import {
    And,
    Annotation,
    AnonymousFunction,
    AstNode,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    ConstructorField,
    CoreClassReference,
    Dictionary,
    Enum,
    EnumInstantiation,
    Field,
    Interface,
    List,
    Method,
    MethodInvocation,
    Or,
    Parameter,
    Set as SetType,
    String_,
    Switch,
    Ternary,
    TestClass,
    Type,
    TypeLiteral,
    TypeParameter
} from "./ast";
import { PrimitiveInstantiation } from "./ast/InstantiatedPrimitive";
import { ReadOnlyMemory } from "./ast/ReadOnlymemory";
import { IDictionary, type Map } from "./ast/Type";
import { DictionaryEntry } from "./ast/TypeLiteral";
import { XmlDocBlock } from "./ast/XmlDocBlock";
import { BaseCsharpCustomConfigSchema } from "./custom-config/BaseCsharpCustomConfigSchema";
import { NameRegistry } from "./utils/nameRegistry";
import { stacktrace } from "./utils/stacktrace";

/**
 * Main class for generating C# code using an Abstract Syntax Tree (AST) approach.
 *
 * This class serves as the primary factory and registry for creating C# code elements
 * including classes, methods, types, and other language constructs. It maintains
 * a name registry to ensure proper namespace handling and class reference management.
 *
 * The class supports a "freeze" mechanism where after freezing, any new class references
 * are tracked separately to help identify missing dependencies during code generation.
 *
 * @example
 * ```typescript
 * const csharp = new CSharp();
 * const myClass = csharp.class_({
 *   name: "MyClass",
 *   namespace: "MyNamespace"
 * });
 * ```
 */
export class CSharp {
    /**
     * Registry for managing class names and ensuring proper namespace resolution.
     * This registry tracks all known classes and their fully qualified names.
     */
    public readonly nameRegistry = new NameRegistry();

    /**
     * Indicates whether the class reference registry has been frozen.
     * When frozen, new class references are tracked separately in extraClassReferences.
     */
    frozen = false;

    /**
     * Map tracking class references that were created after the registry was frozen.
     * Keys are fully qualified class names, values are sets of stack traces showing
     * where these references were used.
     */
    extraClassReferences = new Map<string, Set<string>>();

    /**
     * Creates a reference to a C# class with the specified name and namespace.
     *
     * This method handles class reference creation and tracks usage when the registry
     * is frozen. If the registry is frozen and the class reference is not already
     * registered, it will be tracked in extraClassReferences with stack trace information.
     *
     * @param args - Configuration for the class reference including name, namespace, and optional generics
     * @returns A ClassReference object representing the C# class
     *
     * @example
     * ```typescript
     * const stringRef = csharp.classReference({
     *   name: "String",
     *   namespace: "System"
     * });
     *
     * const genericListRef = csharp.classReference({
     *   name: "List",
     *   namespace: "System.Collections.Generic",
     *   generics: [stringRef]
     * });
     * ```
     */
    public classReference(args: ClassReference.Args): ClassReference {
        const fullyQualifiedName = NameRegistry.fullyQualifiedNameOf(args);
        if (this.frozen) {
            // check if the class reference is already known
            if (!this.nameRegistry.isRegistered(fullyQualifiedName)) {
                // this wasn't in the registry before we were frozen.
                let set = this.extraClassReferences.get(fullyQualifiedName);
                if (!set) {
                    set = new Set();
                    this.extraClassReferences.set(fullyQualifiedName, set);
                }

                // remember where we saw this type being used
                set.add(
                    `${fullyQualifiedName} -\n${stacktrace()
                        .map((each) => `   ${each.fn} - ${each.path}:${each.position}`)
                        .join("\n")}`
                );
            }
        }
        return this.nameRegistry.createClassReference(args, fullyQualifiedName, this);
    }

    /**
     * Freezes the class reference registry, preventing new class registrations.
     * After freezing, any new class references will be tracked in extraClassReferences.
     * This is useful for identifying missing dependencies during code generation.
     */
    freezeClassReferences() {
        this.frozen = true;
    }

    /**
     * Creates a C# class definition.
     *
     * @param args - Configuration for the class including name, namespace, fields, methods, etc.
     * @returns A Class object representing the C# class definition
     */
    class_(args: Class.Args): Class {
        return new Class(args, this);
    }

    /**
     * Creates a C# test class definition with NUnit test framework attributes.
     *
     * @param args - Configuration for the test class
     * @returns A TestClass object representing the C# test class definition
     */
    public testClass(args: TestClass.Args): TestClass {
        return new TestClass(args, this);
    }

    /**
     * Creates a C# attribute/annotation.
     *
     * @param args - Configuration for the annotation including name and parameters
     * @returns An Annotation object representing the C# attribute
     */
    public annotation(args: Annotation.Args): Annotation {
        return new Annotation(args, this);
    }

    /**
     * Creates a C# class instantiation (new ClassName() expression).
     *
     * @param args - Configuration for the class instantiation including class reference and constructor arguments
     * @returns A ClassInstantiation object representing the C# object creation
     */
    public instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
        return new ClassInstantiation(args, this);
    }

    /**
     * Creates a C# method invocation expression.
     *
     * @param args - Configuration for the method invocation including method reference and arguments
     * @returns A MethodInvocation object representing the C# method call
     */
    public invokeMethod(args: MethodInvocation.Args): MethodInvocation {
        return new MethodInvocation(args, this);
    }

    /**
     * Creates a reference to a core C# class (built-in types like string, int, etc.).
     *
     * @param args - Configuration for the core class reference
     * @returns A CoreClassReference object representing the C# core type
     */
    public coreClassReference(args: CoreClassReference.Args): CoreClassReference {
        return new CoreClassReference(args, this);
    }

    /**
     * Creates a C# code block containing multiple statements.
     *
     * @param arg - Configuration for the code block including statements
     * @returns A CodeBlock object representing the C# code block
     */
    public codeblock(arg: CodeBlock.Arg): CodeBlock {
        return new CodeBlock(arg, this);
    }

    /**
     * Creates a C# field definition.
     *
     * @param args - Configuration for the field including name, type, and modifiers
     * @returns A Field object representing the C# field
     */
    public field(args: Field.Args): Field {
        return new Field(args, this);
    }

    /**
     * Creates a C# method definition.
     *
     * @param args - Configuration for the method including name, parameters, return type, and body
     * @returns A Method object representing the C# method
     */
    public method(args: Method.Args): Method {
        return new Method(args, this);
    }

    /**
     * Creates a C# anonymous function (lambda expression).
     *
     * @param args - Configuration for the anonymous function including parameters and body
     * @returns An AnonymousFunction object representing the C# lambda
     */
    public anonymousFunction(args: AnonymousFunction.Args): AnonymousFunction {
        return new AnonymousFunction(args);
    }

    /**
     * Creates a C# method parameter.
     *
     * @param args - Configuration for the parameter including name, type, and modifiers
     * @returns A Parameter object representing the C# parameter
     */
    public parameter(args: Parameter.Args): Parameter {
        return new Parameter(args, this);
    }

    /**
     * Creates a C# generic type parameter.
     *
     * @param args - Either a string name or TypeParameter.Args configuration
     * @returns A TypeParameter object representing the C# generic type parameter
     */
    public typeParameter(args: string | TypeParameter.Args): TypeParameter {
        if (typeof args === "string") {
            args = { name: args };
        }
        return new TypeParameter(args, this);
    }

    /**
     * Creates a C# interface definition.
     *
     * @param args - Configuration for the interface including name, namespace, and members
     * @returns An Interface object representing the C# interface
     */
    public interface_(args: Interface.Args): Interface {
        return new Interface(args, this);
    }

    /**
     * Creates a C# enum definition.
     *
     * @param args - Configuration for the enum including name, namespace, and values
     * @returns An Enum object representing the C# enum
     */
    public enum_(args: Enum.Args): Enum {
        return new Enum(args, this);
    }

    /**
     * Creates a C# dictionary literal expression.
     *
     * @param args - Configuration for the dictionary including key-value pairs
     * @returns A Dictionary object representing the C# dictionary literal
     */
    public dictionary(args: Dictionary.Args): Dictionary {
        return new Dictionary(args, this);
    }

    /**
     * Creates a C# list literal expression.
     *
     * @param args - Configuration for the list including elements
     * @returns A List object representing the C# list literal
     */
    public list(args: List.Args): List {
        return new List(args, this);
    }

    /**
     * Creates a C# ReadOnlyMemory<T> expression.
     *
     * @param args - Configuration for the ReadOnlyMemory including element type and value
     * @returns A ReadOnlyMemory object representing the C# ReadOnlyMemory expression
     */
    public readOnlyMemory(args: ReadOnlyMemory.Args): ReadOnlyMemory {
        return new ReadOnlyMemory(args, this);
    }

    /**
     * Creates a C# set literal expression.
     *
     * @param args - Configuration for the set including elements
     * @returns A SetType object representing the C# set literal
     */
    public set(args: SetType.Args): SetType {
        return new SetType(args, this);
    }

    /**
     * Creates a C# switch statement or expression.
     *
     * @param args - Configuration for the switch including expression and cases
     * @returns A Switch object representing the C# switch statement
     */
    public switch_(args: Switch.Args): Switch {
        return new Switch(args, this);
    }

    /**
     * Creates a C# ternary operator expression (condition ? trueValue : falseValue).
     *
     * @param args - Configuration for the ternary including condition, true value, and false value
     * @returns A Ternary object representing the C# ternary expression
     */
    public ternary(args: Ternary.Args): Ternary {
        return new Ternary(args, this);
    }

    /**
     * Creates a C# logical AND expression (&&).
     *
     * @param args - Configuration for the AND expression including left and right operands
     * @returns An And object representing the C# logical AND expression
     */
    public and(args: And.Args): And {
        return new And(args, this);
    }

    /**
     * Creates a C# logical OR expression (||).
     *
     * @param args - Configuration for the OR expression including left and right operands
     * @returns An Or object representing the C# logical OR expression
     */
    public or(args: Or.Args): Or {
        return new Or(args, this);
    }

    /**
     * Creates a C# enum value instantiation.
     *
     * @param args - Configuration for the enum instantiation including enum reference and value
     * @returns An EnumInstantiation object representing the C# enum value
     */
    public enumInstantiation(args: EnumInstantiation.Args): EnumInstantiation {
        return new EnumInstantiation(args, this);
    }

    /**
     * Creates a C# string literal expression.
     *
     * @param args - Configuration for the string including value and formatting
     * @returns A String_ object representing the C# string literal
     */
    public string_(args: String_.Args): String_ {
        return new String_(args, this);
    }

    /**
     * Creates a C# XML documentation block.
     *
     * @param arg - Configuration for the XML documentation including content
     * @returns An XmlDocBlock object representing the C# XML documentation
     */
    public xmlDocBlock(arg: XmlDocBlock.Arg): XmlDocBlock {
        return new XmlDocBlock(arg, this);
    }

    /**
     * Factory methods for creating primitive value instantiations.
     * These methods create PrimitiveInstantiation objects that represent literal values
     * in the generated C# code.
     */
    public InstantiatedPrimitive = {
        /**
         * Creates a string literal instantiation.
         *
         * @param value - The string value
         * @returns A PrimitiveInstantiation representing the string literal
         */
        string: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "string",
                    value
                },
                this
            );
        },

        /**
         * Creates a boolean literal instantiation.
         *
         * @param value - The boolean value
         * @returns A PrimitiveInstantiation representing the boolean literal
         */
        boolean: (value: boolean) => {
            return new PrimitiveInstantiation(
                {
                    type: "boolean",
                    value
                },
                this
            );
        },

        /**
         * Creates an integer literal instantiation.
         *
         * @param value - The integer value
         * @returns A PrimitiveInstantiation representing the integer literal
         */
        integer: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "integer",
                    value
                },
                this
            );
        },

        /**
         * Creates a long literal instantiation.
         *
         * @param value - The long value
         * @returns A PrimitiveInstantiation representing the long literal
         */
        long: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "long",
                    value
                },
                this
            );
        },

        /**
         * Creates an unsigned integer literal instantiation.
         *
         * @param value - The unsigned integer value
         * @returns A PrimitiveInstantiation representing the uint literal
         */
        uint: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "uint",
                    value
                },
                this
            );
        },

        /**
         * Creates an unsigned long literal instantiation.
         *
         * @param value - The unsigned long value
         * @returns A PrimitiveInstantiation representing the ulong literal
         */
        ulong: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "ulong",
                    value
                },
                this
            );
        },

        /**
         * Creates a float literal instantiation.
         *
         * @param value - The float value
         * @returns A PrimitiveInstantiation representing the float literal
         */
        float: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "float",
                    value
                },
                this
            );
        },

        /**
         * Creates a double literal instantiation.
         *
         * @param value - The double value
         * @returns A PrimitiveInstantiation representing the double literal
         */
        double: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "double",
                    value
                },
                this
            );
        },

        /**
         * Creates a date literal instantiation.
         *
         * @param value - The date value as a string
         * @returns A PrimitiveInstantiation representing the date literal
         */
        date: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "date",
                    value
                },
                this
            );
        },

        /**
         * Creates a DateTime literal instantiation.
         *
         * @param value - The DateTime value
         * @param parse - Whether to parse the DateTime value (default: true)
         * @returns A PrimitiveInstantiation representing the DateTime literal
         */
        dateTime: (value: Date, parse = true) => {
            return new PrimitiveInstantiation(
                {
                    type: "dateTime",
                    value,
                    parse
                },
                this
            );
        },

        /**
         * Creates a UUID literal instantiation.
         *
         * @param value - The UUID value as a string
         * @returns A PrimitiveInstantiation representing the UUID literal
         */
        uuid: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "uuid",
                    value
                },
                this
            );
        },

        /**
         * Creates a null literal instantiation.
         *
         * @returns A PrimitiveInstantiation representing the null literal
         */
        null: () => {
            return new PrimitiveInstantiation(
                {
                    type: "null"
                },
                this
            );
        }
    };

    getDefaultValue(type: Type) {
        switch (type.internalType.type) {
            case "string":
                return this.TypeLiteral.string("");
            case "bool":
                return this.TypeLiteral.boolean(false);
            case "int":
                return this.TypeLiteral.integer(0);
            case "long":
                return this.TypeLiteral.long(0);
            case "uint":
                return this.TypeLiteral.uint(0);
            case "ulong":
                return this.TypeLiteral.ulong(0);
            case "float":
                return this.TypeLiteral.float(0);
            case "double":
                return this.TypeLiteral.double(0);
            case "dateTime":
                return this.TypeLiteral.datetime(new Date().toISOString());
            case "object":
                return this.TypeLiteral.null();
            case "array":
                return this.TypeLiteral.null();
            case "listType":
                return this.TypeLiteral.null();
            case "list":
                return this.TypeLiteral.null();
            case "set":
                return this.TypeLiteral.null();
            case "map":
                return this.TypeLiteral.null();
            case "idictionary":
                return this.TypeLiteral.null();
            case "keyValuePair":
                return this.TypeLiteral.null();
            case "optional":
                return this.TypeLiteral.null();
            case "fileParam":
                return this.TypeLiteral.null();
            case "func":
                return this.TypeLiteral.null();
            case "action":
                return this.TypeLiteral.null();
            case "csharpType":
                return this.TypeLiteral.null();
            case "byte[]":
            default:
                return this.TypeLiteral.null();
        }
    }

    /**
     * Factory methods for creating C# type definitions.
     * These methods create Type objects that represent C# type declarations
     * including primitive types, collections, and custom types.
     */
    public Type = {
        /**
         * Creates a string type.
         *
         * @returns A Type object representing the C# string type
         */
        string: () => {
            return new Type(
                {
                    type: "string"
                },
                this
            );
        },

        /**
         * Creates a string type.
         *
         * @returns A Type object representing the C# string type
         */
        binary: () => {
            return new Type(
                {
                    type: "byte[]"
                },
                this
            );
        },

        /**
         * Creates a boolean type.
         *
         * @returns A Type object representing the C# bool type
         */
        boolean: () => {
            return new Type(
                {
                    type: "bool"
                },
                this
            );
        },

        /**
         * Creates an integer type.
         *
         * @returns A Type object representing the C# int type
         */
        integer: () => {
            return new Type(
                {
                    type: "int"
                },
                this
            );
        },

        /**
         * Creates a long type.
         *
         * @returns A Type object representing the C# long type
         */
        long: () => {
            return new Type(
                {
                    type: "long"
                },
                this
            );
        },

        /**
         * Creates an unsigned integer type.
         *
         * @returns A Type object representing the C# uint type
         */
        uint: () => {
            return new Type(
                {
                    type: "uint"
                },
                this
            );
        },

        /**
         * Creates an unsigned long type.
         *
         * @returns A Type object representing the C# ulong type
         */
        ulong: () => {
            return new Type(
                {
                    type: "ulong"
                },
                this
            );
        },

        /**
         * Creates a float type.
         *
         * @returns A Type object representing the C# float type
         */
        float: () => {
            return new Type(
                {
                    type: "float"
                },
                this
            );
        },

        /**
         * Creates a double type.
         *
         * @returns A Type object representing the C# double type
         */
        double: () => {
            return new Type(
                {
                    type: "double"
                },
                this
            );
        },

        /**
         * Creates a DateOnly type.
         *
         * @returns A Type object representing the C# DateOnly type
         */
        dateOnly: () => {
            return new Type(
                {
                    type: "dateOnly"
                },
                this
            );
        },

        /**
         * Creates a DateTime type.
         *
         * @returns A Type object representing the C# DateTime type
         */
        dateTime: () => {
            return new Type(
                {
                    type: "dateTime"
                },
                this
            );
        },

        /**
         * Creates a Guid type.
         *
         * @returns A Type object representing the C# Guid type
         */
        uuid: () => {
            return new Type(
                {
                    type: "uuid"
                },
                this
            );
        },

        /**
         * Creates an object type.
         *
         * @returns A Type object representing the C# object type
         */
        object: () => {
            return new Type(
                {
                    type: "object"
                },
                this
            );
        },

        /**
         * Creates an array type.
         *
         * @param value - The element type of the array
         * @returns A Type object representing the C# array type
         */
        array: (value: Type) => {
            return new Type(
                {
                    type: "array",
                    value
                },
                this
            );
        },

        /**
         * Creates a list type.
         *
         * @param value - The element type of the list
         * @returns A Type object representing the C# List<T> type
         */
        listType: (value: Type) => {
            return new Type(
                {
                    type: "listType",
                    value
                },
                this
            );
        },

        /**
         * Creates a generic list type.
         *
         * @param value - The element type of the list
         * @returns A Type object representing the C# List<T> type
         */
        list: (value: Type) => {
            return new Type(
                {
                    type: "list",
                    value
                },
                this
            );
        },

        /**
         * Creates a set type.
         *
         * @param value - The element type of the set
         * @returns A Type object representing the C# HashSet<T> type
         */
        set: (value: Type) => {
            return new Type(
                {
                    type: "set",
                    value
                },
                this
            );
        },

        /**
         * Creates a map/dictionary type.
         *
         * @param keyType - The key type of the map
         * @param valueType - The value type of the map
         * @param options - Optional configuration for the map
         * @returns A Type object representing the C# Dictionary<TKey, TValue> type
         */
        map: (keyType: Type, valueType: Type, options?: Map.Options) => {
            return new Type(
                {
                    type: "map",
                    keyType,
                    valueType,
                    options
                },
                this
            );
        },

        /**
         * Creates an IDictionary type.
         *
         * @param keyType - The key type of the dictionary
         * @param valueType - The value type of the dictionary
         * @param options - Optional configuration for the dictionary
         * @returns A Type object representing the C# IDictionary<TKey, TValue> type
         */
        idictionary: (keyType: Type, valueType: Type, options?: IDictionary.Options) => {
            return new Type(
                {
                    type: "idictionary",
                    keyType,
                    valueType,
                    options
                },
                this
            );
        },

        /**
         * Creates a KeyValuePair type.
         *
         * @param keyType - The key type of the pair
         * @param valueType - The value type of the pair
         * @returns A Type object representing the C# KeyValuePair<TKey, TValue> type
         */
        keyValuePair: (keyType: Type, valueType: Type) => {
            return new Type(
                {
                    type: "keyValuePair",
                    keyType,
                    valueType
                },
                this
            );
        },

        /**
         * Creates a nullable/optional type.
         *
         * @param value - The underlying type to make optional
         * @returns A Type object representing the C# nullable type (T?)
         */
        optional: (value: Type) => {
            if (Type.isAlreadyOptional(value)) {
                // Avoids double optional.
                return value;
            }
            return new Type(
                {
                    type: "optional",
                    value
                },
                this
            );
        },

        /**
         * Creates a reference to a custom class type.
         *
         * @param value - The class reference
         * @returns A Type object representing the custom class type
         */
        reference: (value: ClassReference) => {
            return new Type(
                {
                    type: "reference",
                    value
                },
                this
            );
        },

        /**
         * Creates a reference to a core C# class type.
         *
         * @param value - The core class reference
         * @returns A Type object representing the core class type
         */
        coreClass: (value: CoreClassReference) => {
            return new Type(
                {
                    type: "coreReference",
                    value
                },
                this
            );
        },

        /**
         * Creates a OneOf union type.
         *
         * @param memberValues - Array of possible types in the union
         * @returns A Type object representing the OneOf<T1, T2, ...> type
         */
        oneOf: (memberValues: Type[]) => {
            return new Type(
                {
                    type: "oneOf",
                    memberValues
                },
                this
            );
        },

        /**
         * Creates a OneOfBase union type.
         *
         * @param memberValues - Array of possible types in the union
         * @returns A Type object representing the OneOfBase<T1, T2, ...> type
         */
        oneOfBase: (memberValues: Type[]) => {
            return new Type(
                {
                    type: "oneOfBase",
                    memberValues
                },
                this
            );
        },

        /**
         * Creates a string enum type.
         *
         * @param value - The class reference for the string enum
         * @returns A Type object representing the string enum type
         */
        stringEnum: (value: ClassReference) => {
            return new Type(
                {
                    type: "stringEnum",
                    value
                },
                this
            );
        },

        /**
         * Creates an Action delegate type.
         *
         * @param typeParameters - Array of type parameters for the Action
         * @returns A Type object representing the C# Action<T1, T2, ...> type
         */
        action: ({ typeParameters }: { typeParameters: (Type | TypeParameter)[] }) => {
            return new Type(
                {
                    type: "action",
                    typeParameters
                },
                this
            );
        },

        /**
         * Creates a Func delegate type.
         *
         * @param typeParameters - Array of type parameters for the Func
         * @param returnType - The return type of the Func
         * @returns A Type object representing the C# Func<T1, T2, ..., TResult> type
         */
        func: ({
            typeParameters,
            returnType
        }: {
            typeParameters: (Type | TypeParameter)[];
            returnType: Type | TypeParameter;
        }) => {
            return new Type(
                {
                    type: "func",
                    typeParameters,
                    returnType
                },
                this
            );
        },

        /**
         * Creates a generic C# type placeholder.
         *
         * @returns A Type object representing a generic C# type
         */
        csharpType: () => {
            return new Type(
                {
                    type: "csharpType"
                },
                this
            );
        },

        /**
         * Creates a file parameter type.
         *
         * @param classReference - The class reference for the file parameter
         * @returns A Type object representing a file parameter type
         */
        fileParam: (classReference: ClassReference) => {
            return new Type(
                {
                    type: "fileParam",
                    value: classReference
                },
                this
            );
        }
    };

    /**
     * Factory methods for creating C# type literals.
     * These methods create TypeLiteral objects that represent literal values
     * and object initializers in the generated C# code.
     */
    public TypeLiteral = {
        /**
         * Creates a class literal with constructor field initialization.
         *
         * @param reference - The class reference
         * @param fields - Array of constructor fields to initialize
         * @returns A TypeLiteral object representing the class initialization
         */
        class_: ({ reference, fields }: { reference: ClassReference; fields: ConstructorField[] }) => {
            return new TypeLiteral({ type: "class", reference, fields }, this);
        },

        /**
         * Creates a dictionary literal with key-value pairs.
         *
         * @param keyType - The type of dictionary keys
         * @param valueType - The type of dictionary values
         * @param entries - Array of dictionary entries
         * @returns A TypeLiteral object representing the dictionary initialization
         */
        dictionary: ({
            keyType,
            valueType,
            entries
        }: {
            keyType: Type;
            valueType: Type;
            entries: DictionaryEntry[];
        }) => {
            return new TypeLiteral({ type: "dictionary", keyType, valueType, entries }, this);
        },

        /**
         * Creates a list literal with elements.
         *
         * @param valueType - The type of list elements
         * @param values - Array of literal values
         * @returns A TypeLiteral object representing the list initialization
         */
        list: ({ valueType, values }: { valueType: Type; values: TypeLiteral[] }) => {
            return new TypeLiteral({ type: "list", valueType, values }, this);
        },

        /**
         * Creates a set literal with elements.
         *
         * @param valueType - The type of set elements
         * @param values - Array of literal values
         * @returns A TypeLiteral object representing the set initialization
         */
        set: ({ valueType, values }: { valueType: Type; values: TypeLiteral[] }) => {
            return new TypeLiteral({ type: "set", valueType, values }, this);
        },

        /**
         * Creates a boolean literal.
         *
         * @param value - The boolean value
         * @returns A TypeLiteral object representing the boolean literal
         */
        boolean: (value: boolean) => {
            return new TypeLiteral({ type: "boolean", value }, this);
        },

        /**
         * Creates a float literal.
         *
         * @param value - The float value
         * @returns A TypeLiteral object representing the float literal
         */
        float: (value: number) => {
            return new TypeLiteral({ type: "float", value }, this);
        },

        /**
         * Creates a date literal.
         *
         * @param value - The date value as a string
         * @returns A TypeLiteral object representing the date literal
         */
        date: (value: string) => {
            return new TypeLiteral({ type: "date", value }, this);
        },

        /**
         * Creates a DateTime literal.
         *
         * @param value - The DateTime value as a string
         * @returns A TypeLiteral object representing the DateTime literal
         */
        datetime: (value: string) => {
            return new TypeLiteral({ type: "datetime", value }, this);
        },

        /**
         * Creates a decimal literal.
         *
         * @param value - The decimal value
         * @returns A TypeLiteral object representing the decimal literal
         */
        decimal: (value: number) => {
            return new TypeLiteral({ type: "decimal", value }, this);
        },

        /**
         * Creates a double literal.
         *
         * @param value - The double value
         * @returns A TypeLiteral object representing the double literal
         */
        double: (value: number) => {
            return new TypeLiteral({ type: "double", value }, this);
        },

        /**
         * Creates an integer literal.
         *
         * @param value - The integer value
         * @returns A TypeLiteral object representing the integer literal
         */
        integer: (value: number) => {
            return new TypeLiteral({ type: "integer", value }, this);
        },

        /**
         * Creates a long literal.
         *
         * @param value - The long value
         * @returns A TypeLiteral object representing the long literal
         */
        long: (value: number) => {
            return new TypeLiteral({ type: "long", value }, this);
        },

        /**
         * Creates an unsigned integer literal.
         *
         * @param value - The unsigned integer value
         * @returns A TypeLiteral object representing the uint literal
         */
        uint: (value: number) => {
            return new TypeLiteral({ type: "uint", value }, this);
        },

        /**
         * Creates an unsigned long literal.
         *
         * @param value - The unsigned long value
         * @returns A TypeLiteral object representing the ulong literal
         */
        ulong: (value: number) => {
            return new TypeLiteral({ type: "ulong", value }, this);
        },

        /**
         * Creates a reference literal.
         *
         * @param value - The AST node reference
         * @returns A TypeLiteral object representing the reference literal
         */
        reference: (value: AstNode) => {
            return new TypeLiteral(
                {
                    type: "reference",
                    value
                },
                this
            );
        },

        /**
         * Creates a string literal.
         *
         * @param value - The string value
         * @returns A TypeLiteral object representing the string literal
         */
        string: (value: string) => {
            return new TypeLiteral(
                {
                    type: "string",
                    value
                },
                this
            );
        },

        /**
         * Creates a null literal.
         *
         * @returns A TypeLiteral object representing the null literal
         */
        null: () => {
            return new TypeLiteral({ type: "null" }, this);
        },

        /**
         * Creates a no-operation literal (placeholder).
         *
         * @returns A TypeLiteral object representing a no-operation literal
         */
        nop: () => {
            return new TypeLiteral({ type: "nop" }, this);
        },

        /**
         * Creates an unknown type literal.
         *
         * @param value - The unknown value
         * @returns A TypeLiteral object representing the unknown literal
         */
        unknown: (value: unknown) => {
            return new TypeLiteral({ type: "unknown", value }, this);
        },

        /**
         * Checks if a TypeLiteral is a no-operation literal.
         *
         * @param typeLiteral - The TypeLiteral to check
         * @returns True if the TypeLiteral is a no-operation literal
         */
        isNop: (typeLiteral: TypeLiteral) => {
            return typeLiteral.internalType.type === "nop";
        }
    };

    /**
     * Converts an XmlDocBlock-like object to an XmlDocBlock instance.
     * If the input is already an XmlDocBlock, it returns it as-is.
     * Otherwise, it creates a new XmlDocBlock from the input.
     *
     * @param xmlDocBlockLike - Either an XmlDocBlock instance or XmlDocBlock.Like object
     * @returns An XmlDocBlock instance
     */
    public xmlDocBlockOf(xmlDocBlockLike: XmlDocBlock.Like): XmlDocBlock {
        return xmlDocBlockLike instanceof XmlDocBlock ? xmlDocBlockLike : new XmlDocBlock(xmlDocBlockLike, this);
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
    readonly VALID_READ_ONLY_MEMORY_TYPES = new Set<string>([
        this.Type.integer().internalType.type,
        this.Type.long().internalType.type,
        this.Type.uint().internalType.type,
        this.Type.ulong().internalType.type,
        this.Type.string().internalType.type,
        this.Type.boolean().internalType.type,
        this.Type.float().internalType.type,
        this.Type.double().internalType.type
    ]);

    /**
     * Validates that the read-only-memory-types custom config option contains only valid types.
     *
     * This method checks that all types specified in the 'read-only-memory-types' configuration
     * are supported by the code generator. If any invalid types are found, it throws an error
     * with details about which types are valid.
     *
     * @param customConfig - The custom configuration schema to validate
     * @throws Error if any invalid types are found in the read-only-memory-types configuration
     */
    validateReadOnlyMemoryTypes(customConfig: BaseCsharpCustomConfigSchema): void {
        const readOnlyMemoryTypes = customConfig["read-only-memory-types"];
        if (readOnlyMemoryTypes != null) {
            for (const type of readOnlyMemoryTypes) {
                if (!this.VALID_READ_ONLY_MEMORY_TYPES.has(type)) {
                    throw new Error(
                        `Type "${type}" is not a valid 'read-only-memory-types' custom config option; expected one of ${JSON.stringify(
                            this.VALID_READ_ONLY_MEMORY_TYPES
                        )}.`
                    );
                }
            }
        }
    }

    /**
     * Pre-defined references to commonly used System namespace classes and types.
     * This object provides convenient access to standard .NET Framework types
     * without having to manually create class references.
     */
    readonly System = {
        /**
         * Reference to System.Enum class.
         */
        Enum: this.classReference({
            name: "Enum",
            namespace: "System"
        }),

        /**
         * Reference to System.Exception class.
         */
        Exception: this.classReference({
            name: "Exception",
            namespace: "System"
        }),

        /**
         * Reference to System.SerializableAttribute class.
         */
        Serializable: this.classReference({
            name: "Serializable",
            namespace: "System"
        }),

        /**
         * Reference to System.String class.
         */
        String: this.classReference({
            name: "String",
            namespace: "System"
        }),

        /**
         * Reference to System.TimeSpan class.
         */
        TimeSpan: this.classReference({
            name: "TimeSpan",
            namespace: "System"
        }),
        /**
         * Reference to System.Uri class.
         */
        Uri: this.classReference({
            name: "Uri",
            namespace: "System"
        }),
        /**
         * Reference to System.UriBuilder class.
         */
        UriBuilder: this.classReference({
            name: "UriBuilder",
            namespace: "System"
        }),
        /**
         * Runtime namespace references.
         */
        Runtime: {
            /**
             * Serialization namespace references.
             */
            Serialization: {
                /**
                 * Reference to System.Runtime.Serialization.EnumMemberAttribute class.
                 */
                EnumMember: this.classReference({
                    name: "EnumMember",
                    namespace: "System.Runtime.Serialization"
                })
            } as const
        } as const,
        /**
         * Collections namespace references.
         */
        Collections: {
            /**
             * Generic collections namespace references.
             */
            Generic: {
                /**
                 * Creates a reference to IAsyncEnumerable<T>.
                 *
                 * @param elementType - The element type (optional)
                 * @returns A ClassReference for IAsyncEnumerable<T>
                 */
                IAsyncEnumerable: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "IAsyncEnumerable",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },

                /**
                 * Creates a reference to IEnumerable<T>.
                 *
                 * @param elementType - The element type (optional)
                 * @returns A ClassReference for IEnumerable<T>
                 */
                IEnumerable: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "IEnumerable",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },

                /**
                 * Creates a reference to KeyValuePair<TKey, TValue>.
                 *
                 * @param keyType - The key type (optional)
                 * @param valueType - The value type (optional)
                 * @returns A ClassReference for KeyValuePair<TKey, TValue>
                 */
                KeyValuePair: (
                    keyType?: ClassReference | TypeParameter | Type,
                    valueType?: ClassReference | TypeParameter | Type
                ) => {
                    return this.classReference({
                        name: "KeyValuePair",
                        namespace: "System.Collections.Generic",
                        generics: keyType && valueType ? [keyType, valueType] : undefined
                    });
                },

                /**
                 * Creates a reference to List<T>.
                 *
                 * @param elementType - The element type (optional)
                 * @returns A ClassReference for List<T>
                 */
                List: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "List",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },

                /**
                 * Creates a reference to HashSet<T>.
                 *
                 * @param elementType - The element type (optional)
                 * @returns A ClassReference for HashSet<T>
                 */
                HashSet: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "HashSet",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },

                /**
                 * Creates a reference to Dictionary<TKey, TValue>.
                 *
                 * @param keyType - The key type (optional)
                 * @param valueType - The value type (optional)
                 * @returns A ClassReference for Dictionary<TKey, TValue>
                 */
                Dictionary: (
                    keyType?: ClassReference | TypeParameter | Type,
                    valueType?: ClassReference | TypeParameter | Type
                ) => {
                    return this.classReference({
                        name: "Dictionary",
                        namespace: "System.Collections.Generic",
                        generics: keyType && valueType ? [keyType, valueType] : undefined
                    });
                }
            } as const,

            /**
             * LINQ namespace references.
             */
            Linq: {
                /**
                 * Reference to System.Linq.Enumerable class.
                 */
                Enumerable: this.classReference({
                    name: "Enumerable",
                    namespace: "System.Linq"
                })
            } as const
        } as const,
        /**
         * Globalization namespace references.
         */
        Globalization: {
            /**
             * Reference to System.Globalization.DateTimeStyles enum.
             */
            DateTimeStyles: this.classReference({
                name: "DateTimeStyles",
                namespace: "System.Globalization"
            })
        } as const,

        /**
         * LINQ namespace references.
         */
        Linq: {
            /**
             * Reference to System.Linq.Enumerable class.
             */
            Enumerable: this.classReference({
                name: "Enumerable",
                namespace: "System.Linq"
            })
        } as const,
        /**
         * Net namespace references.
         */
        Net: {
            /**
             * HTTP namespace references.
             */
            Http: {
                /**
                 * Reference to System.Net.Http.HttpClient class.
                 */
                HttpClient: this.classReference({
                    name: "HttpClient",
                    namespace: "System.Net.Http"
                }),

                /**
                 * Reference to System.Net.Http.HttpMethod class.
                 */
                HttpMethod: this.classReference({
                    name: "HttpMethod",
                    namespace: "System.Net.Http"
                }),

                /**
                 * Reference to System.Net.Http.Headers.HttpResponseHeaders class.
                 */
                HttpResponseHeaders: this.classReference({
                    name: "HttpResponseHeaders",
                    namespace: "System.Net.Http.Headers"
                })
            } as const,
            /**
             * ServerSentEvents namespace references.
             */
            ServerSentEvents: {
                /**
                 * Reference to System.Net.ServerSentEvents.SseEvent class.
                 */
                SseEvent: this.classReference({
                    name: "SseEvent",
                    namespace: "System.Net.ServerSentEvents"
                }),
                SseParser: this.classReference({
                    name: "SseParser",
                    namespace: "System.Net.ServerSentEvents"
                })
            } as const,
            WebSockets: {
                ClientWebSocketOptions: this.classReference({
                    name: "ClientWebSocketOptions",
                    namespace: "System.Net.WebSockets"
                })
            } as const
        } as const,
        /**
         * IO namespace references.
         */
        IO: {
            /**
             * Reference to System.IO.MemoryStream class.
             */
            MemoryStream: this.classReference({
                name: "MemoryStream",
                namespace: "System.IO"
            }),
            Stream: this.classReference({
                name: "Stream",
                namespace: "System.IO"
            }),
            /**
             * Reference to System.IO.StreamReader class.
             */
            StreamReader: this.classReference({
                name: "StreamReader",
                namespace: "System.IO"
            })
        } as const,
        /**
         * Text namespace references.
         */
        Text: {
            /**
             * Reference to System.Text.Encoding class.
             */
            Encoding: this.classReference({
                name: "Encoding",
                namespace: "System.Text"
            }),

            /**
             * Reference to System.Text.Encoding.UTF8 class.
             */
            Encoding_UTF8: this.classReference({
                name: "UTF8",
                namespace: "System.Text",
                enclosingType: this.classReference({
                    name: "Encoding",
                    namespace: "System.Text"
                })
            }),
            /**
             * JSON namespace references.
             */
            Json: {
                /**
                 * Reference to System.Text.Json.JsonElement class.
                 */
                JsonElement: this.classReference({
                    name: "JsonElement",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.JsonDocument class.
                 */
                JsonDocument: this.classReference({
                    name: "JsonDocument",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.JsonException class.
                 */
                JsonException: this.classReference({
                    name: "JsonException",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.Utf8JsonReader class.
                 */
                Utf8JsonReader: this.classReference({
                    name: "Utf8JsonReader",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.JsonSerializerOptions class.
                 */
                JsonSerializerOptions: this.classReference({
                    name: "JsonSerializerOptions",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.JsonSerializer class.
                 */
                JsonSerializer: this.classReference({
                    name: "JsonSerializer",
                    namespace: "System.Text.Json"
                }),

                /**
                 * Reference to System.Text.Json.Utf8JsonWriter class.
                 */
                Utf8JsonWriter: this.classReference({
                    name: "Utf8JsonWriter",
                    namespace: "System.Text.Json"
                }),

                /**
                 * JSON Nodes namespace references.
                 */
                Nodes: {
                    /**
                     * Reference to System.Text.Json.Nodes.JsonNode class.
                     */
                    JsonNode: this.classReference({
                        name: "JsonNode",
                        namespace: "System.Text.Json.Nodes"
                    }),

                    /**
                     * Reference to System.Text.Json.Nodes.JsonObject class.
                     */
                    JsonObject: this.classReference({
                        name: "JsonObject",
                        namespace: "System.Text.Json.Nodes"
                    })
                } as const,
                /**
                 * JSON Serialization namespace references.
                 */
                Serialization: {
                    /**
                     * Reference to System.Text.Json.Serialization.IJsonOnDeserialized interface.
                     */
                    IJsonOnDeserialized: this.classReference({
                        name: "IJsonOnDeserialized",
                        namespace: "System.Text.Json.Serialization"
                    }),

                    /**
                     * Reference to System.Text.Json.Serialization.IJsonOnSerializing interface.
                     */
                    IJsonOnSerializing: this.classReference({
                        name: "IJsonOnSerializing",
                        namespace: "System.Text.Json.Serialization"
                    }),

                    /**
                     * Reference to System.Text.Json.Serialization.JsonOnDeserializedAttribute class.
                     */
                    JsonOnDeserializedAttribute: this.classReference({
                        name: "JsonOnDeserializedAttribute",
                        namespace: "System.Text.Json.Serialization"
                    }),

                    /**
                     * Reference to System.Text.Json.Serialization.JsonExtensionDataAttribute class.
                     */
                    JsonExtensionData: this.classReference({
                        name: "JsonExtensionData",
                        namespace: "System.Text.Json.Serialization"
                    }),

                    /**
                     * Creates a reference to JsonConverter<T>.
                     *
                     * @param typeToConvert - The type to convert (optional)
                     * @returns A ClassReference for JsonConverter<T>
                     */
                    JsonConverter: (typeToConvert?: ClassReference | TypeParameter | Type) => {
                        return this.classReference({
                            name: "JsonConverter",
                            namespace: "System.Text.Json.Serialization",
                            generics: typeToConvert ? [typeToConvert] : undefined
                        });
                    },

                    /**
                     * Reference to System.Text.Json.Serialization.JsonIgnoreAttribute class.
                     */
                    JsonIgnore: this.classReference({
                        name: "JsonIgnore",
                        namespace: "System.Text.Json.Serialization"
                    }),

                    /**
                     * Reference to System.Text.Json.Serialization.JsonPropertyNameAttribute class.
                     */
                    JsonPropertyName: this.classReference({
                        name: "JsonPropertyName",
                        namespace: "System.Text.Json.Serialization"
                    })
                } as const
            } as const
        } as const,
        /**
         * Threading namespace references.
         */
        Threading: {
            /**
             * Reference to System.Threading.CancellationToken struct.
             */
            CancellationToken: this.classReference({
                name: "CancellationToken",
                namespace: "System.Threading"
            }),

            /**
             * Tasks namespace references.
             */
            Tasks: {
                /**
                 * Creates a reference to Task<T>.
                 *
                 * @param ofType - The result type (optional)
                 * @returns A ClassReference for Task<T>
                 */
                Task: (ofType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "Task",
                        namespace: "System.Threading.Tasks",
                        generics: ofType ? [ofType] : undefined
                    });
                }
            } as const
        } as const
    } as const;

    /**
     * Pre-defined references to NUnit testing framework classes and attributes.
     * This object provides convenient access to NUnit test attributes
     * for generating test classes and methods.
     */
    readonly NUnit = {
        /**
         * NUnit Framework namespace references.
         */
        Framework: {
            /**
             * Reference to NUnit.Framework.TestFixtureAttribute class.
             */
            TestFixture: this.classReference({
                name: "TestFixture",
                namespace: "NUnit.Framework"
            }),

            /**
             * Reference to NUnit.Framework.TestAttribute class.
             */
            Test: this.classReference({
                name: "Test",
                namespace: "NUnit.Framework"
            })
        } as const
    } as const;
    /**
     * Pre-defined references to OneOf library classes for union types.
     * This object provides convenient access to OneOf union type classes
     * for creating discriminated unions in C#.
     */
    readonly OneOf = {
        /**
         * Creates a reference to OneOf<T1, T2, ...>.
         *
         * @param generics - Array of generic type parameters (optional)
         * @returns A ClassReference for OneOf<T1, T2, ...>
         */
        OneOf: (generics?: ClassReference[] | TypeParameter[] | Type[]) => {
            return this.classReference({
                name: "OneOf",
                namespace: "OneOf",
                generics
            });
        },

        /**
         * Creates a reference to OneOfBase<T1, T2, ...>.
         *
         * @param generics - Array of generic type parameters (optional)
         * @returns A ClassReference for OneOfBase<T1, T2, ...>
         */
        OneOfBase: (generics?: ClassReference[] | TypeParameter[] | Type[]) => {
            return this.classReference({
                name: "OneOfBase",
                namespace: "OneOf",
                generics
            });
        }
    } as const;

    /**
     * Pre-defined references to Google Protocol Buffers classes.
     * This object provides convenient access to Google.Protobuf types
     * for working with Protocol Buffer well-known types.
     */
    public Google = {
        /**
         * Protocol Buffers namespace references.
         */
        Protobuf: {
            /**
             * Well-known types namespace references with namespace alias.
             */
            WellKnownTypes: {
                /**
                 * Reference to Google.Protobuf.WellKnownTypes.Struct class.
                 */
                Struct: this.classReference({
                    name: "Struct",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),

                /**
                 * Reference to Google.Protobuf.WellKnownTypes.Value class.
                 */
                Value: this.classReference({
                    name: "Value",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),

                /**
                 * Reference to Google.Protobuf.WellKnownTypes.ListValue class.
                 */
                ListValue: this.classReference({
                    name: "ListValue",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),

                /**
                 * Reference to Google.Protobuf.WellKnownTypes.Timestamp class.
                 */
                Timestamp: this.classReference({
                    name: "Timestamp",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                })
            } as const
        } as const
    } as const;
}
