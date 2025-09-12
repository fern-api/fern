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

export class CSharp {
    public readonly nameRegistry = new NameRegistry();

    frozen = false;

    freezeClassReferences() {
        this.frozen = true;
    }
    seen = new Map<string, number>();

    public classReference(args: ClassReference.Args): ClassReference {
        const fullyQualifiedName = NameRegistry.fullyQualifiedNameOf(args);
        if (this.frozen) {
            // check if the class reference is already known
            if (
                //!this.seen.has(fullyQualifiedName) &&
                !this.nameRegistry.isRegistered(fullyQualifiedName)
            ) {
                this.seen.set(fullyQualifiedName, 1);
                // this means we haven't seen this before
                // write it out as an error so we can find them
                console.log(
                    `${fullyQualifiedName} -\n${stacktrace()
                        .map((each) => `   ${each.fn} - ${each.path}:${each.position}`)
                        .join("\n")}`
                );
            }
        }
        return this.nameRegistry.createClassReference(args, fullyQualifiedName, this);
    }

    class_(args: Class.Args): Class {
        return new Class(args, this);
    }

    public testClass(args: TestClass.Args): TestClass {
        return new TestClass(args, this);
    }

    public annotation(args: Annotation.Args): Annotation {
        return new Annotation(args, this);
    }

    public instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
        return new ClassInstantiation(args, this);
    }

    public invokeMethod(args: MethodInvocation.Args): MethodInvocation {
        return new MethodInvocation(args, this);
    }

    public coreClassReference(args: CoreClassReference.Args): CoreClassReference {
        return new CoreClassReference(args, this);
    }

    public codeblock(arg: CodeBlock.Arg): CodeBlock {
        return new CodeBlock(arg, this);
    }

    public field(args: Field.Args): Field {
        return new Field(args, this);
    }

    public method(args: Method.Args): Method {
        return new Method(args, this);
    }

    public anonymousFunction(args: AnonymousFunction.Args): AnonymousFunction {
        return new AnonymousFunction(args);
    }

    public parameter(args: Parameter.Args): Parameter {
        return new Parameter(args, this);
    }

    public typeParameter(args: string | TypeParameter.Args): TypeParameter {
        if (typeof args === "string") {
            args = { name: args };
        }
        return new TypeParameter(args, this);
    }

    public interface_(args: Interface.Args): Interface {
        return new Interface(args, this);
    }

    public enum_(args: Enum.Args): Enum {
        return new Enum(args, this);
    }

    public dictionary(args: Dictionary.Args): Dictionary {
        return new Dictionary(args, this);
    }

    public list(args: List.Args): List {
        return new List(args, this);
    }

    public readOnlyMemory(args: ReadOnlyMemory.Args): ReadOnlyMemory {
        return new ReadOnlyMemory(args, this);
    }

    public set(args: SetType.Args): SetType {
        return new SetType(args, this);
    }

    public switch_(args: Switch.Args): Switch {
        return new Switch(args, this);
    }

    public ternary(args: Ternary.Args): Ternary {
        return new Ternary(args, this);
    }

    public and(args: And.Args): And {
        return new And(args, this);
    }

    public or(args: Or.Args): Or {
        return new Or(args, this);
    }

    public enumInstantiation(args: EnumInstantiation.Args): EnumInstantiation {
        return new EnumInstantiation(args, this);
    }

    public string_(args: String_.Args): String_ {
        return new String_(args, this);
    }

    public xmlDocBlock(arg: XmlDocBlock.Arg): XmlDocBlock {
        return new XmlDocBlock(arg, this);
    }

    public InstantiatedPrimitive = {
        string: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "string",
                    value
                },
                this
            );
        },

        boolean: (value: boolean) => {
            return new PrimitiveInstantiation(
                {
                    type: "boolean",
                    value
                },
                this
            );
        },

        integer: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "integer",
                    value
                },
                this
            );
        },

        long: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "long",
                    value
                },
                this
            );
        },

        uint: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "uint",
                    value
                },
                this
            );
        },

        ulong: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "ulong",
                    value
                },
                this
            );
        },

        float: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "float",
                    value
                },
                this
            );
        },

        double: (value: number) => {
            return new PrimitiveInstantiation(
                {
                    type: "double",
                    value
                },
                this
            );
        },

        date: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "date",
                    value
                },
                this
            );
        },

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

        uuid: (value: string) => {
            return new PrimitiveInstantiation(
                {
                    type: "uuid",
                    value
                },
                this
            );
        },

        null: () => {
            return new PrimitiveInstantiation(
                {
                    type: "null"
                },
                this
            );
        }
    };

    public Type = {
        /* Static factory methods for creating a Type */
        string: () => {
            return new Type(
                {
                    type: "string"
                },
                this
            );
        },

        boolean: () => {
            return new Type(
                {
                    type: "bool"
                },
                this
            );
        },

        integer: () => {
            return new Type(
                {
                    type: "int"
                },
                this
            );
        },

        long: () => {
            return new Type(
                {
                    type: "long"
                },
                this
            );
        },

        uint: () => {
            return new Type(
                {
                    type: "uint"
                },
                this
            );
        },

        ulong: () => {
            return new Type(
                {
                    type: "ulong"
                },
                this
            );
        },

        float: () => {
            return new Type(
                {
                    type: "float"
                },
                this
            );
        },

        double: () => {
            return new Type(
                {
                    type: "double"
                },
                this
            );
        },

        dateOnly: () => {
            return new Type(
                {
                    type: "dateOnly"
                },
                this
            );
        },

        dateTime: () => {
            return new Type(
                {
                    type: "dateTime"
                },
                this
            );
        },

        uuid: () => {
            return new Type(
                {
                    type: "uuid"
                },
                this
            );
        },

        object: () => {
            return new Type(
                {
                    type: "object"
                },
                this
            );
        },

        array: (value: Type) => {
            return new Type(
                {
                    type: "array",
                    value
                },
                this
            );
        },

        listType: (value: Type) => {
            return new Type(
                {
                    type: "listType",
                    value
                },
                this
            );
        },

        list: (value: Type) => {
            return new Type(
                {
                    type: "list",
                    value
                },
                this
            );
        },

        set: (value: Type) => {
            return new Type(
                {
                    type: "set",
                    value
                },
                this
            );
        },

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

        reference: (value: ClassReference) => {
            return new Type(
                {
                    type: "reference",
                    value
                },
                this
            );
        },

        coreClass: (value: CoreClassReference) => {
            return new Type(
                {
                    type: "coreReference",
                    value
                },
                this
            );
        },

        oneOf: (memberValues: Type[]) => {
            return new Type(
                {
                    type: "oneOf",
                    memberValues
                },
                this
            );
        },

        oneOfBase: (memberValues: Type[]) => {
            return new Type(
                {
                    type: "oneOfBase",
                    memberValues
                },
                this
            );
        },

        stringEnum: (value: ClassReference) => {
            return new Type(
                {
                    type: "stringEnum",
                    value
                },
                this
            );
        },

        action: ({ typeParameters }: { typeParameters: (Type | TypeParameter)[] }) => {
            return new Type(
                {
                    type: "action",
                    typeParameters
                },
                this
            );
        },

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

        csharpType: () => {
            return new Type(
                {
                    type: "csharpType"
                },
                this
            );
        },

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

    public TypeLiteral = {
        /* Static factory methods for creating a TypeLiteral */
        class_: ({ reference, fields }: { reference: ClassReference; fields: ConstructorField[] }) => {
            return new TypeLiteral({ type: "class", reference, fields }, this);
        },

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

        list: ({ valueType, values }: { valueType: Type; values: TypeLiteral[] }) => {
            return new TypeLiteral({ type: "list", valueType, values }, this);
        },

        set: ({ valueType, values }: { valueType: Type; values: TypeLiteral[] }) => {
            return new TypeLiteral({ type: "set", valueType, values }, this);
        },

        boolean: (value: boolean) => {
            return new TypeLiteral({ type: "boolean", value }, this);
        },

        float: (value: number) => {
            return new TypeLiteral({ type: "float", value }, this);
        },

        date: (value: string) => {
            return new TypeLiteral({ type: "date", value }, this);
        },

        datetime: (value: string) => {
            return new TypeLiteral({ type: "datetime", value }, this);
        },

        decimal: (value: number) => {
            return new TypeLiteral({ type: "decimal", value }, this);
        },

        double: (value: number) => {
            return new TypeLiteral({ type: "double", value }, this);
        },

        integer: (value: number) => {
            return new TypeLiteral({ type: "integer", value }, this);
        },

        long: (value: number) => {
            return new TypeLiteral({ type: "long", value }, this);
        },

        uint: (value: number) => {
            return new TypeLiteral({ type: "uint", value }, this);
        },

        ulong: (value: number) => {
            return new TypeLiteral({ type: "ulong", value }, this);
        },

        reference: (value: AstNode) => {
            return new TypeLiteral(
                {
                    type: "reference",
                    value
                },
                this
            );
        },

        string: (value: string) => {
            return new TypeLiteral(
                {
                    type: "string",
                    value
                },
                this
            );
        },

        null: () => {
            return new TypeLiteral({ type: "null" }, this);
        },

        nop: () => {
            return new TypeLiteral({ type: "nop" }, this);
        },

        unknown: (value: unknown) => {
            return new TypeLiteral({ type: "unknown", value }, this);
        },

        isNop: (typeLiteral: TypeLiteral) => {
            return typeLiteral.internalType.type === "nop";
        }
    };

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

    readonly System = {
        Enum: this.classReference({
            name: "Enum",
            namespace: "System"
        }),
        Exception: this.classReference({
            name: "Exception",
            namespace: "System"
        }),
        Serializable: this.classReference({
            name: "Serializable",
            namespace: "System"
        }),
        String: this.classReference({
            name: "String",
            namespace: "System"
        }),
        TimeSpan: this.classReference({
            name: "TimeSpan",
            namespace: "System"
        }),
        Runtime: {
            Serialization: {
                EnumMember: this.classReference({
                    name: "EnumMember",
                    namespace: "System.Runtime.Serialization"
                })
            } as const
        } as const,
        Collections: {
            Generic: {
                IAsyncEnumerable: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "IAsyncEnumerable",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },
                IEnumerable: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "IEnumerable",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },
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
                List: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "List",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },
                HashSet: (elementType?: ClassReference | TypeParameter | Type) => {
                    return this.classReference({
                        name: "HashSet",
                        namespace: "System.Collections.Generic",
                        generics: elementType ? [elementType] : undefined
                    });
                },
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
            Linq: {
                Enumerable: this.classReference({
                    name: "Enumerable",
                    namespace: "System.Linq"
                })
            } as const
        } as const,
        Globalization: {
            DateTimeStyles: this.classReference({
                name: "DateTimeStyles",
                namespace: "System.Globalization"
            })
        } as const,
        Linq: {
            Enumerable: this.classReference({
                name: "Enumerable",
                namespace: "System.Linq"
            })
        } as const,
        Net: {
            Http: {
                HttpClient: this.classReference({
                    name: "HttpClient",
                    namespace: "System.Net.Http"
                }),
                HttpMethod: this.classReference({
                    name: "HttpMethod",
                    namespace: "System.Net.Http"
                }),
                HttpResponseHeaders: this.classReference({
                    name: "HttpResponseHeaders",
                    namespace: "System.Net.Http.Headers"
                })
            } as const
        } as const,
        IO: {
            MemoryStream: this.classReference({
                name: "MemoryStream",
                namespace: "System.IO"
            })
        } as const,
        Text: {
            Encoding: this.classReference({
                name: "Encoding",
                namespace: "System.Text"
            }),
            Encoding_UTF8: this.classReference({
                name: "UTF8",
                namespace: "System.Text",
                enclosingType: this.classReference({
                    name: "Encoding",
                    namespace: "System.Text"
                })
            }),
            Json: {
                JsonElement: this.classReference({
                    name: "JsonElement",
                    namespace: "System.Text.Json"
                }),
                JsonException: this.classReference({
                    name: "JsonException",
                    namespace: "System.Text.Json"
                }),
                Utf8JsonReader: this.classReference({
                    name: "Utf8JsonReader",
                    namespace: "System.Text.Json"
                }),
                JsonSerializerOptions: this.classReference({
                    name: "JsonSerializerOptions",
                    namespace: "System.Text.Json"
                }),
                Utf8JsonWriter: this.classReference({
                    name: "Utf8JsonWriter",
                    namespace: "System.Text.Json"
                }),
                Nodes: {
                    JsonNode: this.classReference({
                        name: "JsonNode",
                        namespace: "System.Text.Json.Nodes"
                    }),
                    JsonObject: this.classReference({
                        name: "JsonObject",
                        namespace: "System.Text.Json.Nodes"
                    })
                } as const,
                Serialization: {
                    IJsonOnDeserialized: this.classReference({
                        name: "IJsonOnDeserialized",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    IJsonOnSerializing: this.classReference({
                        name: "IJsonOnSerializing",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    JsonOnDeserializedAttribute: this.classReference({
                        name: "JsonOnDeserializedAttribute",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    JsonExtensionData: this.classReference({
                        name: "JsonExtensionData",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    JsonConverter: (typeToConvert?: ClassReference | TypeParameter | Type) => {
                        return this.classReference({
                            name: "JsonConverter",
                            namespace: "System.Text.Json.Serialization",
                            generics: typeToConvert ? [typeToConvert] : undefined
                        });
                    },
                    JsonIgnore: this.classReference({
                        name: "JsonIgnore",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    JsonPropertyName: this.classReference({
                        name: "JsonPropertyName",
                        namespace: "System.Text.Json.Serialization"
                    })
                } as const
            } as const
        } as const,
        Threading: {
            CancellationToken: this.classReference({
                name: "CancellationToken",
                namespace: "System.Threading"
            }),
            Tasks: {
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

    readonly NUnit = {
        Framework: {
            TestFixture: this.classReference({
                name: "TestFixture",
                namespace: "NUnit.Framework"
            }),
            Test: this.classReference({
                name: "Test",
                namespace: "NUnit.Framework"
            })
        } as const
    } as const;
    readonly OneOf = {
        OneOf: (generics?: ClassReference[] | TypeParameter[] | Type[]) => {
            return this.classReference({
                name: "OneOf",
                namespace: "OneOf",
                generics
            });
        },
        OneOfBase: (generics?: ClassReference[] | TypeParameter[] | Type[]) => {
            return this.classReference({
                name: "OneOfBase",
                namespace: "OneOf",
                generics
            });
        }
    } as const;

    public Google = {
        Protobuf: {
            WellKnownTypes: {
                Struct: this.classReference({
                    name: "Struct",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),
                Value: this.classReference({
                    name: "Value",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),
                ListValue: this.classReference({
                    name: "ListValue",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                }),
                Timestamp: this.classReference({
                    name: "Timestamp",
                    namespace: "Google.Protobuf.WellKnownTypes",
                    namespaceAlias: "WellKnownProto"
                })
            } as const
        } as const
    } as const;
}
/*
export function class_(args: Class.Args): Class {
    return new Class(args, nameRegistry);
}

export function testClass(args: TestClass.Args): TestClass {
    return new TestClass(args, nameRegistry);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
}

export function freezeClassReferences() {
    nameRegistry.freezeClassReferences();
}

export function classReference(args: ClassReference.Args): ClassReference {
    return nameRegistry.classReference(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function coreClassReference(args: CoreClassReference.Args): CoreClassReference {
    return new CoreClassReference(args);
}

export function xmlDocBlock(arg: XmlDocBlock.Arg): XmlDocBlock {
    return new XmlDocBlock(arg);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function field(args: Field.Args): Field {
    return new Field(args, nameRegistry);
}

export function method(args: Method.Args): Method {
    return new Method(args, nameRegistry);
}

export function anonymousFunction(args: AnonymousFunction.Args): AnonymousFunction {
    return new AnonymousFunction(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export function typeParameter(args: string | TypeParameter.Args): TypeParameter {
    if (typeof args === "string") {
        args = { name: args };
    }
    return new TypeParameter(args);
}

export function interface_(args: Interface.Args): Interface {
    return new Interface(args, nameRegistry);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args, nameRegistry);
}

export function dictionary(args: Dictionary.Args): Dictionary {
    return new Dictionary(args);
}

export function list(args: List.Args): List {
    return new List(args);
}

export function readOnlyMemory(args: ReadOnlyMemory.Args): ReadOnlyMemory {
    return new ReadOnlyMemory(args);
}

export function set(args: Set.Args): Set {
    return new Set(args);
}

export function switch_(args: Switch.Args): Switch {
    return new Switch(args);
}

export function ternary(args: Ternary.Args): Ternary {
    return new Ternary(args);
}

export function and(args: And.Args): And {
    return new And(args);
}

export function or(args: Or.Args): Or {
    return new Or(args);
}

export function enumInstantiation(args: EnumInstantiation.Args): EnumInstantiation {
    return new EnumInstantiation(args);
}

export function string_(args: String_.Args): String_ {
    return new String_(args);
}
*/
