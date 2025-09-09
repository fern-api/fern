/**
 * @file Built-in .NET type information for C# code generation
 *
 * This module provides comprehensive mappings of built-in .NET types organized by namespace.
 * It serves as a reference for the C# code generator to identify and properly handle
 * built-in types without generating unnecessary wrapper code.
 *
 */

import { ClassReference } from "../ast/ClassReference";
import { type Type } from "../ast/Type";
import { type TypeParameter } from "../ast/TypeParameter";

/**
 * Type definition for built-in type mappings
 * Maps namespace names to arrays of type names within that namespace
 */
export type BuiltInTypeMap = Record<string, readonly string[]>;

/**
 * Comprehensive mapping of built-in .NET types organized by namespace.
 *
 * This object contains all the standard .NET types that should be treated as built-ins
 * during code generation. Types listed here will be referenced directly rather than
 * generating wrapper classes or custom implementations.
 *
 * The structure is organized as:
 * - Key: Full namespace name (e.g., "System", "System.Collections.Generic")
 * - Value: Array of type names within that namespace
 *
 * @example
 * ```typescript
 * // Access System namespace types
 * const systemTypes = builtIns.System; // ["Exception", "String", "Int32", ...]
 *
 * // Check if a type is built-in
 * const isBuiltIn = builtIns.System.includes("String");
 * ```
 */
export const builtIns: BuiltInTypeMap = {
    // Core System namespace - fundamental types, exceptions, and basic functionality
    System: [
        "AccessViolationException",
        "Action",
        "Activator",
        "AggregateException",
        "AppContext",
        "AppDomain",
        "AppDomainSetup",
        "AppDomainUnloadedException",
        "ApplicationException",
        "ApplicationId",
        "ArgIterator",
        "ArgumentException",
        "ArgumentNullException",
        "ArgumentOutOfRangeException",
        "ArithmeticException",
        "Array",
        "ArrayTypeMismatchException",
        "AssemblyLoadEventArgs",
        "AssemblyLoadEventHandler",
        "AsyncCallback",
        "Attribute",
        "AttributeTargets",
        "AttributeUsageAttribute",
        "BadImageFormatException",
        "Base64FormattingOptions",
        "BitConverter",
        "Boolean",
        "Buffer",
        "Byte",
        "CannotUnloadAppDomainException",
        "Char",
        "CharEnumerator",
        "CLSCompliantAttribute",
        "Console",
        "ConsoleCancelEventArgs",
        "ConsoleCancelEventHandler",
        "ConsoleColor",
        "ConsoleKey",
        "ConsoleKeyInfo",
        "ConsoleModifiers",
        "ConsoleSpecialKey",
        "ContextBoundObject",
        "ContextMarshalException",
        "ContextStaticAttribute",
        "Convert",
        "CultureAwareComparer",
        "DataMisalignedException",
        "DateOnly",
        "DateTime",
        "DateTimeKind",
        "DateTimeOffset",
        "DayOfWeek",
        "DBNull",
        "Decimal",
        "Delegate",
        "DivideByZeroException",
        "DllNotFoundException",
        "Double",
        "DuplicateWaitObjectException",
        "EntryPointNotFoundException",
        "Enum",
        "Environment",
        "EnvironmentVariableTarget",
        "EventArgs",
        "EventHandler",
        "Exception",
        "ExecutionEngineException",
        "FieldAccessException",
        "FlagsAttribute",
        "FormatException",
        "FormattableString",
        "GC",
        "GCCollectionMode",
        "GCGenerationInfo",
        "GCKind",
        "GCMemoryInfo",
        "GCNotificationStatus",
        "Guid",
        "Half",
        "HashCode",
        "IAsyncDisposable",
        "IAsyncResult",
        "ICloneable",
        "IComparable",
        "IConvertible",
        "ICustomFormatter",
        "IDisposable",
        "IFormatProvider",
        "IFormattable",
        "Index",
        "IndexOutOfRangeException",
        "InsufficientExecutionStackException",
        "InsufficientMemoryException",
        "Int128",
        "Int16",
        "Int32",
        "Int64",
        "IntPtr",
        "InvalidCastException",
        "InvalidOperationException",
        "InvalidProgramException",
        "InvalidTimeZoneException",
        "ISpanFormattable",
        "IUtf8SpanFormattable",
        "LoaderOptimization",
        "LoaderOptimizationAttribute",
        "LocalDataStoreSlot",
        "MarshalByRefObject",
        "Math",
        "MathF",
        "MemberAccessException",
        "MemoryExtensions",
        "MethodAccessException",
        "MidpointRounding",
        "MissingFieldException",
        "MissingMemberException",
        "MissingMethodException",
        "ModuleHandle",
        "MTAThreadAttribute",
        "MulticastDelegate",
        "MulticastNotSupportedException",
        "NonSerializedAttribute",
        "NotFiniteNumberException",
        "NotImplementedException",
        "NotSupportedException",
        "Nullable",
        "NullReferenceException",
        "Object",
        "ObjectDisposedException",
        "ObsoleteAttribute",
        "OperatingSystem",
        "OperationCanceledException",
        "OrdinalComparer",
        "OutOfMemoryException",
        "OverflowException",
        "ParamArrayAttribute",
        "PlatformID",
        "PlatformNotSupportedException",
        "Random",
        "Range",
        "RankException",
        "ResolveEventArgs",
        "ResolveEventHandler",
        "RuntimeArgumentHandle",
        "RuntimeFieldHandle",
        "RuntimeMethodHandle",
        "RuntimeTypeHandle",
        "SByte",
        "SerializableAttribute",
        "Single",
        "StackOverflowException",
        "STAThreadAttribute",
        "String",
        "StringComparer",
        "StringComparison",
        "StringNormalizationExtensions",
        "StringSplitOptions",
        "SystemException",
        "ThreadStaticAttribute",
        "TimeOnly",
        "TimeoutException",
        "TimeProvider",
        "TimeSpan",
        "TimeZone",
        "TimeZoneInfo",
        "TimeZoneNotFoundException",
        "Tuple",
        "TupleExtensions",
        "Type",
        "TypeAccessException",
        "TypeCode",
        "TypedReference",
        "TypeInitializationException",
        "TypeLoadException",
        "TypeUnloadedException",
        "UInt128",
        "UInt16",
        "UInt32",
        "UInt64",
        "UIntPtr",
        "UnauthorizedAccessException",
        "UnhandledExceptionEventArgs",
        "UnhandledExceptionEventHandler",
        "UnitySerializationHolder",
        "ValueTuple",
        "ValueType",
        "Version",
        "Void",
        "WeakReference",
        "Buffers",
        "Collections",
        "ComponentModel",
        "Diagnostics",
        "Globalization",
        "IO",
        "Linq",
        "Net",
        "Numerics",
        "Reflection",
        "Resources",
        "Runtime",
        "Security",
        "Text",
        "Threading"
    ],

    // Generic collections and related types
    "System.Collections.Generic": [
        "ByteEqualityComparer",
        "CollectionExtensions",
        "IEnumerable",
        "KeyNotFoundException",
        "KeyValuePair",
        "NonRandomizedStringEqualityComparer",
        "ReferenceEqualityComparer"
    ],

    // File and stream I/O operations
    "System.IO": [
        "BinaryReader",
        "BinaryWriter",
        "BufferedStream",
        "Directory",
        "DirectoryInfo",
        "DirectoryNotFoundException",
        "EndOfStreamException",
        "EnumerationOptions",
        "File",
        "FileAccess",
        "FileAttributes",
        "FileInfo",
        "FileLoadException",
        "FileMode",
        "FileNotFoundException",
        "FileOptions",
        "FileShare",
        "FileStream",
        "FileStreamOptions",
        "FileSystemInfo",
        "HandleInheritability",
        "InvalidDataException",
        "IOException",
        "MatchCasing",
        "MatchType",
        "MemoryStream",
        "Path",
        "PathTooLongException",
        "RandomAccess",
        "SearchOption",
        "SeekOrigin",
        "Stream",
        "StreamReader",
        "StreamWriter",
        "StringReader",
        "StringWriter",
        "TextReader",
        "TextWriter",
        "UnixFileMode",
        "UnmanagedMemoryAccessor",
        "UnmanagedMemoryStream",
        "System.IO.Enumeration"
    ],

    // Language Integrated Query (LINQ) functionality
    "System.Linq": ["Enumerable"],

    // HTTP client functionality
    "System.Net.Http": [
        "HttpClient",
        "HttpMethod"
    ],

    // Threading and synchronization primitives
    "System.Threading": [
        "AbandonedMutexException",
        "ApartmentState",
        "AsyncFlowControl",
        "AutoResetEvent",
        "CancellationToken",
        "CancellationTokenRegistration",
        "CancellationTokenSource",
        "CompressedStack",
        "ContextCallback",
        "EventResetMode",
        "EventWaitHandle",
        "ExecutionContext",
        "Interlocked",
        "IOCompletionCallback",
        "IThreadPoolWorkItem",
        "ITimer",
        "LazyInitializer",
        "LazyThreadSafetyMode",
        "Lock",
        "LockRecursionException",
        "LockRecursionPolicy",
        "ManualResetEvent",
        "ManualResetEventSlim",
        "Monitor",
        "Mutex",
        "NativeOverlapped",
        "Overlapped",
        "ParameterizedThreadStart",
        "PeriodicTimer",
        "PreAllocatedOverlapped",
        "ReaderWriterLockSlim",
        "RegisteredWaitHandle",
        "Semaphore",
        "SemaphoreFullException",
        "SemaphoreSlim",
        "SendOrPostCallback",
        "SpinLock",
        "SpinWait",
        "SynchronizationContext",
        "SynchronizationLockException",
        "Thread",
        "ThreadAbortException",
        "ThreadExceptionEventArgs",
        "ThreadExceptionEventHandler",
        "ThreadInterruptedException",
        "ThreadPool",
        "ThreadPoolBoundHandle",
        "ThreadPriority",
        "ThreadStart",
        "ThreadStartException",
        "ThreadState",
        "ThreadStateException",
        "Timeout",
        "Timer",
        "TimerCallback",
        "Volatile",
        "WaitCallback",
        "WaitHandle",
        "WaitHandleCannotBeOpenedException",
        "WaitHandleExtensions",
        "WaitOrTimerCallback",
        "Tasks"
    ],

    // Task-based asynchronous programming (TAP) model
    "System.Threading.Tasks": [
        "ConcurrentExclusiveSchedulerPair",
        "ConfigureAwaitOptions",
        "Task",
        "TaskAsyncEnumerableExtensions",
        "TaskCanceledException",
        "TaskCompletionSource",
        "TaskContinuationOptions",
        "TaskCreationOptions",
        "TaskExtensions",
        "TaskFactory",
        "TaskScheduler",
        "TaskSchedulerException",
        "TaskStatus",
        "TaskToAsyncResult",
        "UnobservedTaskExceptionEventArgs",
        "ValueTask",
        "Sources"
    ]
};

/**
 * Utility class for accessing commonly used System namespace types.
 *
 * This class provides convenient static getters for frequently referenced
 * built-in types, allowing for cleaner code generation patterns.
 *
 * @example
 * ```typescript
 * // Get a reference to System.Exception
 * const exceptionType = System.Exception;
 *
 * // Use in code generation
 * const exceptionClass = System.Exception;
 * ```
 */
export const System = {
    get Enum() {
        return new ClassReference({
            name: "Enum",
            namespace: "System"
        });
    },

    /**
     * Gets a class reference to System.Exception.
     *
     * This is the base class for all exceptions in .NET and is commonly
     * used in error handling scenarios during code generation.
     *
     * @returns A class reference object for System.Exception
     */
    get Exception() {
        return new ClassReference({
            name: "Exception",
            namespace: "System"
        });
    },

    get Serializable() {
        return new ClassReference({
            name: "Serializable",
            namespace: "System"
        });
    },

    get String() {
        return new ClassReference({
            name: "String",
            namespace: "System"
        });
    },

    get TimeSpan() {
        return new ClassReference({
            name: "TimeSpan",
            namespace: "System"
        });
    },

    /**
     * Nested static class for Runtime-related types.
     *
     * This provides access to System.Runtime namespace types
     * in a hierarchical structure.
     */
    Runtime: {
        /**
         * Nested object for Serialization-related types.
         */
        Serialization: {
            /**
             * Gets a class reference to System.Runtime.Serialization.EnumMember.
             *
             * @returns A class reference object for System.Runtime.Serialization.EnumMember
             */
            get EnumMember() {
                return new ClassReference({
                    name: "EnumMember",
                    namespace: "System.Runtime.Serialization"
                });
            }
        } as const
    } as const,

    Collections: {
        Generic: {
            IAsyncEnumerable(elementType: ClassReference | TypeParameter | Type) {
                return new ClassReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [elementType]
                });
            },
            IEnumerable(elementType: ClassReference | TypeParameter | Type) {
                return new ClassReference({
                    name: "IEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [elementType]
                });
            },
            KeyValuePair(keyType: ClassReference | TypeParameter | Type, valueType: ClassReference | TypeParameter | Type) {
                return new ClassReference({
                    name: "KeyValuePair",
                    namespace: "System.Collections.Generic",
                    generics: [keyType, valueType]
                });
            },
            List(elementType: ClassReference | TypeParameter | Type) {
                return new ClassReference({
                    name: "List",
                    namespace: "System.Collections.Generic",
                    generics: [elementType]
                });
            },
            HashSet(elementType: ClassReference | TypeParameter | Type) {
                return new ClassReference({
                    name: "HashSet",
                    namespace: "System.Collections.Generic",
                    generics: [elementType]
                });
            },
            Dictionary(
                keyType: ClassReference | TypeParameter | Type,
                valueType: ClassReference | TypeParameter | Type
            ) {
                return new ClassReference({
                    name: "Dictionary",
                    namespace: "System.Collections.Generic",
                    generics: [keyType, valueType]
                });
            }
        } as const
    } as const,

    Globalization: {
        get DateTimeStyles() {
            return new ClassReference({
                name: "DateTimeStyles",
                namespace: "System.Globalization"
            });
        }
    } as const,

    Linq: {
        get Enumerable() {
            return new ClassReference({
                name: "Enumerable",
                namespace: "System.Linq"
            });
        }
    } as const,

    Net: {
        Http: {
            get HttpClient() {
                return new ClassReference({
                    name: "HttpClient",
                    namespace: "System.Net.Http"
                });
            },
            get HttpMethod() {
                return new ClassReference({
                    name: "HttpMethod",
                    namespace: "System.Net.Http"
                });
            },
            get HttpResponseHeaders() {
                return new ClassReference({
                    namespace: "System.Net.Http.Headers",
                    name: "HttpResponseHeaders"
                });
            }
        } as const
    } as const,

    IO: {
        get MemoryStream() {
            return new ClassReference({
                namespace: "System.IO",
                name: "MemoryStream"
            });
        }
    } as const,

    Text: {
        get Encoding() {
            return new ClassReference({
                namespace: "System.Text",
                name: "Encoding"
            });
        },
        get Encoding_UTF8() {
            return new ClassReference({
                namespace: "System.Text",
                enclosingType: System.Text.Encoding,
                name: "UTF8"
            });
        },
        Json: {
            get JsonElement() {
                return new ClassReference({
                    namespace: "System.Text.Json",
                    name: "JsonElement"
                });
            },
            get JsonException() {
                return new ClassReference({
                    namespace: "System.Text.Json",
                    name: "JsonException"
                });
            },
            get Utf8JsonReader() {
                return new ClassReference({
                    namespace: "System.Text.Json",
                    name: "Utf8JsonReader"
                });
            },
            get JsonSerializerOptions() {
                return new ClassReference({
                    namespace: "System.Text.Json",
                    name: "JsonSerializerOptions"
                });
            },
            get Utf8JsonWriter() {
                return new ClassReference({
                    namespace: "System.Text.Json",
                    name: "Utf8JsonWriter"
                });
            },
            Nodes: {
                get JsonNode() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Nodes",
                        name: "JsonNode"
                    });
                },
                get JsonObject() {
                  return new ClassReference({
                      namespace: "System.Text.Json.Nodes",
                      name: "JsonObject"
                  });
              },
            } as const,
            
            Serialization: {
                get IJsonOnDeserialized() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "IJsonOnDeserialized"
                    });
                },
                get IJsonOnSerializing() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "IJsonOnSerializing"
                    });
                },
                get JsonOnDeserializedAttribute() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "JsonOnDeserializedAttribute"
                    });
                },
                get JsonExtensionData() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "JsonExtensionData"
                    });
                },
                JsonConverter(typeToConvert?: ClassReference | TypeParameter | Type) {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "JsonConverter",
                        generics: typeToConvert ? [typeToConvert] : undefined
                    });
                },
                get JsonIgnore() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "JsonIgnore"
                    });
                },
                get JsonPropertyName() {
                    return new ClassReference({
                        namespace: "System.Text.Json.Serialization",
                        name: "JsonPropertyName"
                    });
                }
            } as const
        } as const
    } as const,

    Threading: {
      get CancellationToken() {
        return new ClassReference({
            namespace: "System.Threading",
            name: "CancellationToken"
        });
    },
        Tasks: {
            Task(ofType?: ClassReference | TypeParameter | Type)   {
                return new ClassReference({
                    namespace: "System.Threading.Tasks",
                    name: "Task",
                    generics: ofType ? [ofType] : undefined
                });
            }
        } as const
    } as const
} as const;

export const NUnit = {
  Framework: {
    get TestFixture() {
      return new ClassReference({
          namespace: "NUnit.Framework",
          name: "TestFixture"
        });
    },
    get Test() {
      return new ClassReference({
        namespace: "NUnit.Framework",
        name: "Test"
      });
    }

  } as const,
} as const;
