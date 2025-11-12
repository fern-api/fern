import { type Type } from "../ast/types/Type";
import { type Generation } from "../context/generation-info";
import { lazy } from "../utils/lazy";

/**
 * Provides access to external type references for C# code generation.
 * Offers pre-defined references to commonly used .NET Framework types, third-party libraries,
 * and testing frameworks.
 */
export class Extern {
    constructor(private readonly generation: Generation) {}
    protected get csharp() {
        return this.generation.csharp;
    }
    /**
     * Pre-defined references to commonly used System namespace classes and types.
     * This object provides convenient access to standard .NET Framework types
     * without having to manually create class references.
     *
     * All values are lazy initialized - simple references are cached, functions remain callable.
     */
    readonly System = lazy({
        /**
         * Creates a reference to System.Action<T> delegate.
         *
         * @param typeParameters - The generic type parameters (optional)
         * @returns A ClassReference for Action<T>
         */
        Action: (typeParameters?: Type[]) =>
            this.csharp.classReference({
                name: "Action",
                namespace: "System",
                generics: typeParameters ? typeParameters : undefined,
                multipartMethodName: null, // can not be added to multipart form
                multipartMethodNameForCollection: null, // can not be added to multipart form
                isReferenceType: true // is historically a "reference" type
            }),
        /**
         * Creates a reference to System.Func<TArgs..., TResult> delegate.
         *
         * @param typeParameters - The parameter types (optional)
         * @param returnType - The return type (optional)
         * @returns A ClassReference for Func<TArgs..., TResult>
         */
        Func: (typeParameters?: Type[], returnType?: Type) =>
            this.csharp.classReference({
                name: "Func",
                namespace: "System",
                generics: typeParameters
                    ? returnType
                        ? [...typeParameters, returnType]
                        : typeParameters
                    : returnType
                      ? [returnType]
                      : undefined,
                multipartMethodName: null, // can not be added to multipart form
                multipartMethodNameForCollection: null, // can not be added to multipart form,
                isReferenceType: true // is historically a "reference" type
            }),
        /**
         * Reference to System.DateOnly class.
         */
        DateOnly: () =>
            this.csharp.classReference({
                name: "DateOnly",
                namespace: "System"
            }),
        /**
         * Reference to System.DateTime class.
         */
        DateTime: () =>
            this.csharp.classReference({
                name: "DateTime",
                namespace: "System"
            }),
        /**
         * Reference to System.Enum class.
         */
        Enum: () =>
            this.csharp.classReference({
                name: "Enum",
                namespace: "System"
            }),

        /**
         * Reference to System.Exception class.
         */
        Exception: () =>
            this.csharp.classReference({
                name: "Exception",
                namespace: "System"
            }),

        /**
         * Creates a reference to System.ReadOnlyMemory<T>.
         *
         * @param type - The element type
         * @returns A ClassReference for ReadOnlyMemory<T>
         */
        ReadOnlyMemory: (type: Type) =>
            this.csharp.classReference({
                name: "ReadOnlyMemory",
                namespace: "System",
                generics: [type]
            }),
        /**
         * Reference to System.SerializableAttribute class.
         */
        Serializable: () =>
            this.csharp.classReference({
                name: "Serializable",
                namespace: "System"
            }),

        /**
         * Reference to System.String class.
         */
        String: () =>
            this.csharp.classReference({
                name: "String",
                namespace: "System"
            }),

        /**
         * Reference to System.Type class.
         *
         * @returns A ClassReference for System.Type
         */
        Type: () =>
            this.csharp.classReference({
                name: "Type",
                namespace: "System",
                isReferenceType: true,
                multipartMethodName: null, // can not be added to multipart form
                multipartMethodNameForCollection: null, // can not be added to multipart form
                fullyQualified: true
            }),
        /**
         * Reference to System.TimeSpan class.
         */
        TimeSpan: () =>
            this.csharp.classReference({
                name: "TimeSpan",
                namespace: "System"
            }),
        /**
         * Reference to System.Uri class.
         */
        Uri: () =>
            this.csharp.classReference({
                name: "Uri",
                namespace: "System"
            }),
        /**
         * Reference to System.UriBuilder class.
         */
        UriBuilder: () =>
            this.csharp.classReference({
                name: "UriBuilder",
                namespace: "System"
            }),
        /**
         * Runtime namespace references.
         */
        Runtime: () =>
            lazy({
                /**
                 * Serialization namespace references.
                 */
                Serialization: () =>
                    lazy({
                        /**
                         * Reference to System.Runtime.Serialization.EnumMemberAttribute class.
                         */
                        EnumMember: () =>
                            this.csharp.classReference({
                                name: "EnumMember",
                                namespace: "System.Runtime.Serialization"
                            })
                    })
            }),
        /**
         * Collections namespace references.
         */
        Collections: () =>
            lazy({
                /**
                 * Generic collections namespace references.
                 */
                Generic: () =>
                    lazy({
                        /**
                         * Creates a reference to IAsyncEnumerable<T>.
                         *
                         * @param elementType - The element type (optional)
                         * @returns A ClassReference for IAsyncEnumerable<T>
                         */
                        IAsyncEnumerable: (elementType?: Type) => {
                            return this.csharp.classReference({
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
                        IEnumerable: (elementType?: Type) => {
                            return this.csharp.classReference({
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
                        KeyValuePair: (keyType?: Type, valueType?: Type) => {
                            return this.csharp.classReference({
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
                        List: (elementType?: Type) => {
                            return this.csharp.classReference({
                                name: "List",
                                namespace: "System.Collections.Generic",
                                generics: elementType ? [elementType] : undefined,
                                isCollection: true
                            });
                        },

                        /**
                         * Creates a reference to HashSet<T>.
                         *
                         * @param elementType - The element type (optional)
                         * @returns A ClassReference for HashSet<T>
                         */
                        HashSet: (elementType?: Type) => {
                            return this.csharp.classReference({
                                name: "HashSet",
                                namespace: "System.Collections.Generic",
                                generics: elementType ? [elementType] : undefined,
                                isCollection: true
                            });
                        },

                        /**
                         * Creates a reference to Dictionary<TKey, TValue>.
                         *
                         * @param keyType - The key type (optional)
                         * @param valueType - The value type (optional)
                         * @returns A ClassReference for Dictionary<TKey, TValue>
                         */
                        Dictionary: (keyType?: Type, valueType?: Type) => {
                            return this.csharp.classReference({
                                name: "Dictionary",
                                namespace: "System.Collections.Generic",
                                generics: keyType && valueType ? [keyType, valueType] : undefined,
                                isCollection: true
                            });
                        },
                        /**
                         * Creates a reference to IDictionary<TKey, TValue>.
                         *
                         * @param keyType - The key type
                         * @param valueType - The value type
                         * @returns A ClassReference for IDictionary<TKey, TValue>
                         */
                        IDictionary: (keyType: Type, valueType: Type) =>
                            this.csharp.classReference({
                                name: "IDictionary",
                                namespace: "System.Collections.Generic",
                                generics: [keyType, valueType]
                            })
                    }),

                /**
                 * LINQ namespace references.
                 */
                Linq: () =>
                    lazy({
                        /**
                         * Reference to System.Linq.Enumerable class.
                         */
                        Enumerable: () =>
                            this.csharp.classReference({
                                name: "Enumerable",
                                namespace: "System.Linq"
                            })
                    })
            }),
        /**
         * Globalization namespace references.
         */
        Globalization: () =>
            lazy({
                /**
                 * Reference to System.Globalization.DateTimeStyles enum.
                 */
                DateTimeStyles: () =>
                    this.csharp.classReference({
                        name: "DateTimeStyles",
                        namespace: "System.Globalization"
                    })
            }),

        /**
         * LINQ namespace references.
         */
        Linq: () =>
            lazy({
                /**
                 * Reference to System.Linq.Enumerable class.
                 */
                Enumerable: () =>
                    this.csharp.classReference({
                        name: "Enumerable",
                        namespace: "System.Linq"
                    })
            }),
        /**
         * Net namespace references.
         */
        Net: () =>
            lazy({
                /**
                 * HTTP namespace references.
                 */
                Http: () =>
                    lazy({
                        /**
                         * Reference to System.Net.Http.HttpClient class.
                         */
                        HttpClient: () =>
                            this.csharp.classReference({
                                name: "HttpClient",
                                namespace: "System.Net.Http"
                            }),

                        /**
                         * Reference to System.Net.Http.HttpMethod class.
                         */
                        HttpMethod: () =>
                            this.csharp.classReference({
                                name: "HttpMethod",
                                namespace: "System.Net.Http"
                            }),

                        /**
                         * Reference to System.Net.Http.Headers.HttpResponseHeaders class.
                         */
                        HttpResponseHeaders: () =>
                            this.csharp.classReference({
                                name: "HttpResponseHeaders",
                                namespace: "System.Net.Http.Headers"
                            })
                    }),
                /**
                 * ServerSentEvents namespace references.
                 */
                ServerSentEvents: () =>
                    lazy({
                        /**
                         * Reference to System.Net.ServerSentEvents.SseEvent class.
                         */
                        SseEvent: () =>
                            this.csharp.classReference({
                                name: "SseEvent",
                                namespace: "System.Net.ServerSentEvents"
                            }),
                        /**
                         * Reference to System.Net.ServerSentEvents.SseParser class.
                         */
                        SseParser: () =>
                            this.csharp.classReference({
                                name: "SseParser",
                                namespace: "System.Net.ServerSentEvents"
                            })
                    }),
                /**
                 * WebSockets namespace references.
                 */
                WebSockets: () =>
                    lazy({
                        /**
                         * Reference to System.Net.WebSockets.ClientWebSocketOptions class.
                         */
                        ClientWebSocketOptions: () =>
                            this.csharp.classReference({
                                name: "ClientWebSocketOptions",
                                namespace: "System.Net.WebSockets"
                            })
                    })
            }),
        /**
         * IO namespace references.
         */
        IO: () =>
            lazy({
                /**
                 * Reference to System.IO.MemoryStream class.
                 */
                MemoryStream: () =>
                    this.csharp.classReference({
                        name: "MemoryStream",
                        namespace: "System.IO"
                    }),
                /**
                 * Reference to System.IO.Stream class.
                 */
                Stream: () =>
                    this.csharp.classReference({
                        name: "Stream",
                        namespace: "System.IO"
                    }),
                /**
                 * Reference to System.IO.StreamReader class.
                 */
                StreamReader: () =>
                    this.csharp.classReference({
                        name: "StreamReader",
                        namespace: "System.IO"
                    })
            }),
        /**
         * Text namespace references.
         */
        Text: () =>
            lazy({
                /**
                 * Reference to System.Text.Encoding class.
                 */
                Encoding: () =>
                    this.csharp.classReference({
                        name: "Encoding",
                        namespace: "System.Text"
                    }),

                /**
                 * Reference to System.Text.Encoding.UTF8 class.
                 */
                Encoding_UTF8: () =>
                    this.csharp.classReference({
                        name: "UTF8",
                        enclosingType: this.csharp.classReference({
                            name: "Encoding",
                            namespace: "System.Text"
                        })
                    }),
                /**
                 * JSON namespace references.
                 */
                Json: () =>
                    lazy({
                        /**
                         * Reference to System.Text.Json.JsonElement class.
                         */
                        JsonElement: () =>
                            this.csharp.classReference({
                                name: "JsonElement",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.JsonDocument class.
                         */
                        JsonDocument: () =>
                            this.csharp.classReference({
                                name: "JsonDocument",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.JsonException class.
                         */
                        JsonException: () =>
                            this.csharp.classReference({
                                name: "JsonException",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.Utf8JsonReader class.
                         */
                        Utf8JsonReader: () =>
                            this.csharp.classReference({
                                name: "Utf8JsonReader",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.JsonSerializerOptions class.
                         */
                        JsonSerializerOptions: () =>
                            this.csharp.classReference({
                                name: "JsonSerializerOptions",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.JsonSerializer class.
                         */
                        JsonSerializer: () =>
                            this.csharp.classReference({
                                name: "JsonSerializer",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * Reference to System.Text.Json.Utf8JsonWriter class.
                         */
                        Utf8JsonWriter: () =>
                            this.csharp.classReference({
                                name: "Utf8JsonWriter",
                                namespace: "System.Text.Json"
                            }),

                        /**
                         * JSON Nodes namespace references.
                         */
                        Nodes: () =>
                            lazy({
                                /**
                                 * Reference to System.Text.Json.Nodes.JsonNode class.
                                 */
                                JsonNode: () =>
                                    this.csharp.classReference({
                                        name: "JsonNode",
                                        namespace: "System.Text.Json.Nodes"
                                    }),

                                /**
                                 * Reference to System.Text.Json.Nodes.JsonObject class.
                                 */
                                JsonObject: () =>
                                    this.csharp.classReference({
                                        name: "JsonObject",
                                        namespace: "System.Text.Json.Nodes"
                                    })
                            }),
                        /**
                         * JSON Serialization namespace references.
                         */
                        Serialization: () =>
                            lazy({
                                /**
                                 * Reference to System.Text.Json.Serialization.IJsonOnDeserialized interface.
                                 */
                                IJsonOnDeserialized: () =>
                                    this.csharp.classReference({
                                        name: "IJsonOnDeserialized",
                                        namespace: "System.Text.Json.Serialization"
                                    }),

                                /**
                                 * Reference to System.Text.Json.Serialization.IJsonOnSerializing interface.
                                 */
                                IJsonOnSerializing: () =>
                                    this.csharp.classReference({
                                        name: "IJsonOnSerializing",
                                        namespace: "System.Text.Json.Serialization"
                                    }),

                                /**
                                 * Reference to System.Text.Json.Serialization.JsonOnDeserializedAttribute class.
                                 */
                                JsonOnDeserializedAttribute: () =>
                                    this.csharp.classReference({
                                        name: "JsonOnDeserializedAttribute",
                                        namespace: "System.Text.Json.Serialization"
                                    }),

                                /**
                                 * Reference to System.Text.Json.Serialization.JsonExtensionDataAttribute class.
                                 */
                                JsonExtensionData: () =>
                                    this.csharp.classReference({
                                        name: "JsonExtensionData",
                                        namespace: "System.Text.Json.Serialization"
                                    }),

                                /**
                                 * Creates a reference to JsonConverter<T>.
                                 *
                                 * @param typeToConvert - The type to convert (optional)
                                 * @returns A ClassReference for JsonConverter<T>
                                 */
                                JsonConverter: (typeToConvert?: Type) => {
                                    return this.csharp.classReference({
                                        name: "JsonConverter",
                                        namespace: "System.Text.Json.Serialization",
                                        generics: typeToConvert ? [typeToConvert] : undefined
                                    });
                                },

                                /**
                                 * Reference to System.Text.Json.Serialization.JsonIgnoreAttribute class.
                                 */
                                JsonIgnore: () =>
                                    this.csharp.classReference({
                                        name: "JsonIgnore",
                                        namespace: "System.Text.Json.Serialization"
                                    }),

                                /**
                                 * Reference to System.Text.Json.Serialization.JsonPropertyNameAttribute class.
                                 */
                                JsonPropertyName: () =>
                                    this.csharp.classReference({
                                        name: "JsonPropertyName",
                                        namespace: "System.Text.Json.Serialization"
                                    })
                            })
                    })
            }),
        /**
         * Threading namespace references.
         */
        Threading: () =>
            lazy({
                /**
                 * Reference to System.Threading.CancellationToken struct.
                 */
                CancellationToken: () =>
                    this.csharp.classReference({
                        name: "CancellationToken",
                        namespace: "System.Threading"
                    }),

                /**
                 * Tasks namespace references.
                 */
                Tasks: () =>
                    lazy({
                        /**
                         * Creates a reference to Task<T>.
                         *
                         * @param ofType - The result type (optional)
                         * @returns A ClassReference for Task<T>
                         */
                        Task: (ofType?: Type) => {
                            return this.csharp.classReference({
                                name: "Task",
                                namespace: "System.Threading.Tasks",
                                generics: ofType ? [ofType] : undefined
                            });
                        }
                    })
            })
    });

    /**
     * Pre-defined references to NUnit testing framework classes and attributes.
     * This object provides convenient access to NUnit test attributes
     * for generating test classes and methods.
     *
     * All values are lazy initialized - simple references are cached.
     */
    readonly NUnit = lazy({
        /**
         * NUnit Framework namespace references.
         */
        Framework: () =>
            lazy({
                /**
                 * Reference to NUnit.Framework.TestFixtureAttribute class.
                 */
                TestFixture: () =>
                    this.csharp.classReference({
                        name: "TestFixture",
                        namespace: "NUnit.Framework"
                    }),

                /**
                 * Reference to NUnit.Framework.TestAttribute class.
                 */
                Test: () =>
                    this.csharp.classReference({
                        name: "Test",
                        namespace: "NUnit.Framework"
                    }),
                /**
                 * Reference to NUnit.Framework.OneTimeTearDownAttribute class.
                 */
                OneTimeTearDown: () =>
                    this.csharp.classReference({
                        name: "OneTimeTearDown",
                        namespace: "NUnit.Framework"
                    }),
                /**
                 * Reference to NUnit.Framework.OneTimeSetUpAttribute class.
                 */
                OneTimeSetUp: () =>
                    this.csharp.classReference({
                        name: "OneTimeSetUp",
                        namespace: "NUnit.Framework"
                    }),
                /**
                 * Reference to NUnit.Framework.SetUpFixtureAttribute class.
                 */
                SetUpFixture: () =>
                    this.csharp.classReference({
                        name: "SetUpFixture",
                        namespace: "NUnit.Framework"
                    })
            })
    });

    /**
     * Pre-defined references to OneOf library classes for union types.
     * This object provides convenient access to OneOf union type classes
     * for creating discriminated unions in C#.
     *
     * Functions with parameters remain callable.
     */
    readonly OneOf = lazy({
        /**
         * Creates a reference to OneOf<T1, T2, ...>.
         *
         * @param generics - Array of generic type parameters (optional)
         * @returns A ClassReference for OneOf<T1, T2, ...>
         */
        OneOf: (generics?: Type[]) => {
            return this.csharp.classReference({
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
        OneOfBase: (generics?: Type[]) => {
            return this.csharp.classReference({
                name: "OneOfBase",
                namespace: "OneOf",
                generics
            });
        }
    });

    /**
     * Pre-defined references to Google Protocol Buffers classes.
     * This object provides convenient access to Google.Protobuf types
     * for working with Protocol Buffer well-known types.
     *
     * All values are lazy initialized - simple references are cached.
     */
    readonly Google = lazy({
        /**
         * Protocol Buffers namespace references.
         */
        Protobuf: () =>
            lazy({
                /**
                 * Well-known types namespace references with namespace alias.
                 */
                WellKnownTypes: () =>
                    lazy({
                        /**
                         * Reference to Google.Protobuf.WellKnownTypes.Struct class.
                         */
                        Struct: () =>
                            this.csharp.classReference({
                                name: "Struct",
                                namespace: "Google.Protobuf.WellKnownTypes",
                                namespaceAlias: "WellKnownProto"
                            }),

                        /**
                         * Reference to Google.Protobuf.WellKnownTypes.Value class.
                         */
                        Value: () =>
                            this.csharp.classReference({
                                name: "Value",
                                namespace: "Google.Protobuf.WellKnownTypes",
                                namespaceAlias: "WellKnownProto"
                            }),

                        /**
                         * Reference to Google.Protobuf.WellKnownTypes.ListValue class.
                         */
                        ListValue: () =>
                            this.csharp.classReference({
                                name: "ListValue",
                                namespace: "Google.Protobuf.WellKnownTypes",
                                namespaceAlias: "WellKnownProto"
                            }),

                        /**
                         * Reference to Google.Protobuf.WellKnownTypes.Timestamp class.
                         */
                        Timestamp: () =>
                            this.csharp.classReference({
                                name: "Timestamp",
                                namespace: "Google.Protobuf.WellKnownTypes",
                                namespaceAlias: "WellKnownProto"
                            })
                    })
            })
    });

    /**
     * Pre-defined references to WireMock.Net testing/mocking library classes.
     * This object provides convenient access to WireMock types for creating mock servers
     * and testing HTTP interactions.
     *
     * All values are lazy initialized - simple references are cached.
     */
    readonly WireMock = lazy({
        /**
         * Reference to WireMock.Server.WireMockServer class.
         */
        Server: () =>
            this.csharp.classReference({
                name: "WireMockServer",
                namespace: "WireMock.Server"
            }),
        /**
         * Reference to WireMock.Settings.WireMockServerSettings class.
         */
        WireMockServerSettings: () =>
            this.csharp.classReference({
                name: "WireMockServerSettings",
                namespace: "WireMock.Settings"
            }),
        /**
         * Reference to WireMock.Logging.WireMockConsoleLogger class.
         */
        WireMockConsoleLogger: () =>
            this.csharp.classReference({
                name: "WireMockConsoleLogger",
                namespace: "WireMock.Logging"
            })
    });

    /**
     * Pre-defined references to gRPC library classes.
     * This object provides convenient access to Grpc.Core types for working with
     * gRPC remote procedure calls.
     *
     * All values are lazy initialized - simple references are cached.
     */
    readonly Grpc = lazy({
        /**
         * Grpc.Core namespace references.
         */
        Core: () =>
            lazy({
                /**
                 * Reference to Grpc.Core.RpcException class.
                 */
                RpcException: () =>
                    this.csharp.classReference({
                        name: "RpcException",
                        namespace: "Grpc.Core"
                    })
            })
    });
}
