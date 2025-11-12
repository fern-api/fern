import { fail } from "node:assert";
import { at } from "@fern-api/browser-compatible-base-generator";
import { dynamic, Name, NameAndWireValue } from "@fern-fern/ir-sdk/api";
import {
    And,
    Annotation,
    AnonymousFunction,
    AstNode,
    Set as AstSet,
    Block,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    ConstructorField,
    Dictionary,
    DictionaryEntry,
    Enum,
    EnumInstantiation,
    Interface,
    List,
    Literal,
    MethodInvocation,
    Or,
    Parameter,
    InstantiatedPrimitive as PrimitiveInstantiation,
    ReadOnlyMemory,
    String_,
    Switch,
    Ternary,
    TestClass,
    XmlDocBlock
} from "./ast";
import { Type } from "./ast/types/Type";
import { Generation } from "./context/generation-info";
import { IrNode, Origin } from "./context/model-navigator";
import { NameRegistry } from "./context/name-registry";

interface ClassRefArgsWithNamespace extends ClassReference.Args {
    namespace: string;
    enclosingType?: never;
}

interface ClassRefArgsWithEnclosingType extends ClassReference.Args {
    enclosingType: ClassReference;
    namespace?: never;
}

interface ClassRefWithOriginAndNamespace extends Omit<ClassReference.Args, "name"> {
    origin: Origin;
    namespace: string;
}

interface ClassRefWithOriginAndEnclosingType extends Omit<ClassReference.Args, "name"> {
    origin: Origin;
    enclosingType: ClassReference;
    namespace?: never;
}

interface ClassArgsWithOrigin extends Class.Args {
    origin: Origin;
    name?: never;
}

interface ClassArgsWithName extends Class.Args {
    name: string;
    origin?: never;
}

interface ClassArgsWithReference extends Class.Args {
    reference: ClassReference;
    name?: never; // this should be propogated from reference
    namespace?: never; // this should be propogated from reference
    enclosingType?: never; // this should be propogated from reference
    //origin?: never; // (TODO: removethis?)  this should be propogated from reference
}

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
 * ```
 */
export class CSharp {
    /**
     * Registry for managing class names and ensuring proper namespace resolution.
     * This registry tracks all known classes and their fully qualified names.
     * Now also handles member-level name registration and conflict resolution.
     */

    constructor(private readonly generation: Generation) {}

    private get model() {
        return this.generation.model;
    }

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
     */
    public classReference(
        argz:
            | ClassRefArgsWithNamespace
            | ClassRefArgsWithEnclosingType
            | ClassRefWithOriginAndNamespace
            | ClassRefWithOriginAndEnclosingType
    ): ClassReference {
        return this.classReferenceInternal(argz as ClassReference.Args);
    }

    public classReferenceInternal(args: ClassReference.Args): ClassReference {
        // if we're given an origin, we need to turn that into a name
        if (!args.name && "origin" in args && args.origin) {
            args.name = this.model.getClassNameFor(args.origin);
        }

        if (args.enclosingType) {
            if (args.namespace) {
                throw new Error(`ClassReference: Both enclosingType and namespace cannot be provided`);
            }
            args.namespace = args.enclosingType.namespace;
        }
        const expectedFQN = NameRegistry.fullyQualifiedNameOf(args);
        if (this.frozen) {
            // check if the class reference is already known
            if (!this.generation.registry.isRegisteredTypeName(expectedFQN)) {
                // this wasn't in the registry before we were frozen.
                let set = this.extraClassReferences.get(expectedFQN);
                if (!set) {
                    set = new Set();
                    this.extraClassReferences.set(expectedFQN, set);
                }

                // remember where we saw this type being used
                set.add(`${expectedFQN} -\n${at()}`);
            }
        }
        return this.generation.registry.registerClassReference(
            args as ClassReference.Args & { namespace: string },
            expectedFQN
        );
    }

    /**
     * Freezes the class reference registry, preventing new class registrations.
     * After freezing, any new class references will be tracked in extraClassReferences.
     * This is useful for identifying missing dependencies during code generation.
     */
    freezeClassReferences() {
        this.frozen = true;
    }

    getPropertyName(
        enclosingType: ClassReference,
        property: (IrNode & { name: Name | dynamic.Name }) | (IrNode & { name: NameAndWireValue })
    ) {
        const expectedName = this.model.getPropertyNameFor(property);
        const origin =
            this.model.origin(property) ??
            fail(`Origin not found for property: ${JSON.stringify(property).substring(0, 100)}`);

        const value = enclosingType.getFieldName(origin, expectedName);

        if (value) {
            // we have been told there is a member that looks like the one we want.
            return value;
        }

        // there isn't anything registered that looks like the one we want.
        // we're going to complain, but give them the expected name for now.
        // when we have the order of creation sorted all out, this should be an error.
        // this.generation.logger.warn(
        //   `NOTE: getPropertyName: ${enclosingType.fullyQualifiedName} using unregistered property ${expectedName}`
        // );
        return expectedName;
    }

    /**
     * Creates a C# class definition.
     *
     * @param args - Configuration for the class including name, namespace, fields, methods, etc.
     * @returns A Class object representing the C# class definition
     */
    class_(args: ClassArgsWithOrigin | ClassArgsWithName | ClassArgsWithReference): Class {
        let classArgs: Class.Args = args as Class.Args;
        if ("reference" in args) {
            classArgs = { ...args.reference, ...args };
        }
        return new Class(classArgs, this.generation);
    }

    /**
     * Creates a C# test class definition with NUnit test framework attributes.
     *
     * @param args - Configuration for the test class
     * @returns A TestClass object representing the C# test class definition
     */
    public testClass(args: TestClass.Args): TestClass {
        return new TestClass(args, this.generation);
    }

    /**
     * Creates a C# attribute/annotation.
     *
     * @param args - Configuration for the annotation including name and parameters
     * @returns An Annotation object representing the C# attribute
     */
    public annotation(args: Annotation.Args): Annotation {
        return new Annotation(args, this.generation);
    }

    /**
     * Creates a C# class instantiation (new ClassName() expression).
     *
     * @param args - Configuration for the class instantiation including class reference and constructor arguments
     * @returns A ClassInstantiation object representing the C# object creation
     */
    public instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
        return new ClassInstantiation(args, this.generation);
    }

    /**
     * Creates a C# method invocation expression.
     *
     * @param args - Configuration for the method invocation including method reference and arguments
     * @returns A MethodInvocation object representing the C# method call
     */
    public invokeMethod(args: MethodInvocation.Args): MethodInvocation {
        return new MethodInvocation(args, this.generation);
    }

    /**
     * Creates a C# code block containing multiple statements.
     *
     * @param arg - Configuration for the code block including statements
     * @returns A CodeBlock object representing the C# code block
     */
    public codeblock(arg: CodeBlock.Arg): CodeBlock {
        return new CodeBlock(arg, this.generation);
    }

    public code(): Block {
        return new Block({}, this.generation);
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
        return new Parameter(args, this.generation);
    }

    /**
     * Creates a C# interface definition.
     *
     * @param args - Configuration for the interface including name, namespace, and members
     * @returns An Interface object representing the C# interface
     */
    public interface_(args: Interface.Args): Interface {
        return new Interface(args, this.generation);
    }

    /**
     * Creates a C# enum definition.
     *
     * @param args - Configuration for the enum including name, namespace, and values
     * @returns An Enum object representing the C# enum
     */
    public enum_(args: Enum.Args): Enum {
        return new Enum(args, this.generation);
    }

    /**
     * Creates a C# dictionary literal expression.
     *
     * @param args - Configuration for the dictionary including key-value pairs
     * @returns A Dictionary object representing the C# dictionary literal
     */
    public dictionary(args: Dictionary.Args): Dictionary {
        return new Dictionary(args, this.generation);
    }

    /**
     * Creates a C# list literal expression.
     *
     * @param args - Configuration for the list including elements
     * @returns A List object representing the C# list literal
     */
    public list(args: List.Args): List {
        return new List(args, this.generation);
    }

    /**
     * Creates a C# ReadOnlyMemory<T> expression.
     *
     * @param args - Configuration for the ReadOnlyMemory including element type and value
     * @returns A ReadOnlyMemory object representing the C# ReadOnlyMemory expression
     */
    public readOnlyMemory(args: ReadOnlyMemory.Args): ReadOnlyMemory {
        return new ReadOnlyMemory(args, this.generation);
    }

    /**
     * Creates a C# set literal expression.
     *
     * @param args - Configuration for the set including elements
     * @returns A Set object representing the C# set literal
     */
    public set(args: AstSet.Args): AstSet {
        return new AstSet(args, this.generation);
    }

    /**
     * Creates a C# switch statement or expression.
     *
     * @param args - Configuration for the switch including expression and cases
     * @returns A Switch object representing the C# switch statement
     */
    public switch_(args: Switch.Args): Switch {
        return new Switch(args, this.generation);
    }

    /**
     * Creates a C# ternary operator expression (condition ? trueValue : falseValue).
     *
     * @param args - Configuration for the ternary including condition, true value, and false value
     * @returns A Ternary object representing the C# ternary expression
     */
    public ternary(args: Ternary.Args): Ternary {
        return new Ternary(args, this.generation);
    }

    /**
     * Creates a C# logical AND expression (&&).
     *
     * @param args - Configuration for the AND expression including left and right operands
     * @returns An And object representing the C# logical AND expression
     */
    public and(args: And.Args): And {
        return new And(args, this.generation);
    }

    /**
     * Creates a C# logical OR expression (||).
     *
     * @param args - Configuration for the OR expression including left and right operands
     * @returns An Or object representing the C# logical OR expression
     */
    public or(args: Or.Args): Or {
        return new Or(args, this.generation);
    }

    /**
     * Creates a C# enum value instantiation.
     *
     * @param args - Configuration for the enum instantiation including enum reference and value
     * @returns An EnumInstantiation object representing the C# enum value
     */
    public enumInstantiation(args: EnumInstantiation.Args): EnumInstantiation {
        return new EnumInstantiation(args, this.generation);
    }

    /**
     * Creates a C# string literal expression.
     *
     * @param args - Configuration for the string including value and formatting
     * @returns A String_ object representing the C# string literal
     */
    public string_(args: String_.Args): String_ {
        return new String_(args, this.generation);
    }

    /**
     * Creates a C# XML documentation block.
     *
     * @param arg - Configuration for the XML documentation including content
     * @returns An XmlDocBlock object representing the C# XML documentation
     */
    public xmlDocBlock(arg: XmlDocBlock.Arg): XmlDocBlock {
        return new XmlDocBlock(arg, this.generation);
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
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
                this.generation
            );
        }
    };

    /**
     * Factory methods for creating C# type literals.
     * These methods create Literal objects that represent literal values
     * and object initializers in the generated C# code.
     */
    public Literal = {
        /**
         * Creates a class literal with constructor field initialization.
         *
         * @param reference - The class reference
         * @param fields - Array of constructor fields to initialize
         * @returns A Literal object representing the class initialization
         */
        class_: ({ reference, fields }: { reference: ClassReference; fields: ConstructorField[] }) => {
            return new Literal.Class_(reference, fields, this.generation);
        },

        /**
         * Creates a dictionary literal with key-value pairs.
         *
         * @param keyType - The type of dictionary keys
         * @param valueType - The type of dictionary values
         * @param entries - Array of dictionary entries
         * @returns A Literal object representing the dictionary initialization
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
            return new Literal.Dictionary(keyType, valueType, entries, this.generation);
        },

        /**
         * Creates a list literal with elements.
         *
         * @param valueType - The type of list elements
         * @param values - Array of literal values
         * @returns A Literal object representing the list initialization
         */
        list: ({ valueType, values }: { valueType: Type; values: Literal[] }) => {
            return new Literal.List(valueType, values, this.generation);
        },

        /**
         * Creates a set literal with elements.
         *
         * @param valueType - The type of set elements
         * @param values - Array of literal values
         * @returns A Literal object representing the set initialization
         */
        set: ({ valueType, values }: { valueType: Type; values: Literal[] }) => {
            return new Literal.Set(valueType, values, this.generation);
        },

        /**
         * Creates a boolean literal.
         *
         * @param value - The boolean value
         * @returns A Literal object representing the boolean literal
         */
        boolean: (value: boolean) => {
            return new Literal.Boolean(value, this.generation);
        },

        /**
         * Creates a float literal.
         *
         * @param value - The float value
         * @returns A Literal object representing the float literal
         */
        float: (value: number) => {
            return new Literal.Float(value, this.generation);
        },

        /**
         * Creates a date literal.
         *
         * @param value - The date value as a string
         * @returns A Literal object representing the date literal
         */
        date: (value: string) => {
            return new Literal.Date(value, this.generation);
        },

        /**
         * Creates a DateTime literal.
         *
         * @param value - The DateTime value as a string
         * @returns A Literal object representing the DateTime literal
         */
        datetime: (value: string) => {
            return new Literal.DateTime(value, this.generation);
        },

        /**
         * Creates a decimal literal.
         *
         * @param value - The decimal value
         * @returns A Literal object representing the decimal literal
         */
        decimal: (value: number) => {
            return new Literal.Decimal(value, this.generation);
        },

        /**
         * Creates a double literal.
         *
         * @param value - The double value
         * @returns A Literal object representing the double literal
         */
        double: (value: number) => {
            return new Literal.Double(value, this.generation);
        },

        /**
         * Creates an integer literal.
         *
         * @param value - The integer value
         * @returns A Literal object representing the integer literal
         */
        integer: (value: number) => {
            return new Literal.Integer(value, this.generation);
        },

        /**
         * Creates a long literal.
         *
         * @param value - The long value
         * @returns A Literal object representing the long literal
         */
        long: (value: number) => {
            return new Literal.Long(value, this.generation);
        },

        /**
         * Creates an unsigned integer literal.
         *
         * @param value - The unsigned integer value
         * @returns A Literal object representing the uint literal
         */
        uint: (value: number) => {
            return new Literal.Uint(value, this.generation);
        },

        /**
         * Creates an unsigned long literal.
         *
         * @param value - The unsigned long value
         * @returns A Literal object representing the ulong literal
         */
        ulong: (value: number) => {
            return new Literal.Ulong(value, this.generation);
        },

        /**
         * Creates a reference literal.
         *
         * @param value - The AST node reference
         * @returns A Literal object representing the reference literal
         */
        reference: (value: AstNode) => {
            return new Literal.Reference(value, this.generation);
        },

        /**
         * Creates a string literal.
         *
         * @param value - The string value
         * @returns A Literal object representing the string literal
         */
        string: (value: string) => {
            return new Literal.String(value, this.generation);
        },

        /**
         * Creates a null literal.
         *
         * @returns A Literal object representing the null literal
         */
        null: () => {
            return new Literal.Null(this.generation);
        },

        /**
         * Creates a no-operation literal (placeholder).
         *
         * @returns A Literal object representing a no-operation literal
         */
        nop: () => {
            return new Literal.Nop(this.generation);
        },

        /**
         * Creates an unknown type literal.
         *
         * @param value - The unknown value
         * @returns A Literal object representing the unknown literal
         */
        unknown: (value: unknown) => {
            return new Literal.Unknown(value, this.generation);
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
        return xmlDocBlockLike instanceof XmlDocBlock
            ? xmlDocBlockLike
            : new XmlDocBlock(xmlDocBlockLike, this.generation);
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
        "int",
        "long",
        "uint",
        "ulong",
        "string",
        "bool",
        "float",
        "double"
    ]);

    /**
     * Validates that the read-only-memory-types custom config option contains only valid types.
     *
     * This method checks that all types specified in the 'read-only-memory-types' configuration
     * are supported by the code generator. If any invalid types are found, it throws an error
     * with details about which types are valid.
     *
     * @throws Error if any invalid types are found in the read-only-memory-types configuration
     */
    validateReadOnlyMemoryTypes(): void {
        for (const type of this.generation.settings.readOnlyMemoryTypes) {
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
