/**
 * @fileoverview Built-in .NET type information for C# code generation
 *
 * This module provides comprehensive mappings of built-in .NET types organized by namespace.
 * It serves as a reference for the C# code generator to identify and properly handle
 * built-in types without generating unnecessary wrapper code.
 *
 * @author Fern Code Generator
 * @version 1.0.0
 */

import { classReference } from "../csharp";

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

    // HTTP client functionality (currently empty - may be populated as needed)
    "System.Net.Http": [],

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
// biome-ignore lint/complexity/noStaticOnlyClass: taking advantage of static properties.
export class System {
    /**
     * Gets a class reference to System.Exception.
     *
     * This is the base class for all exceptions in .NET and is commonly
     * used in error handling scenarios during code generation.
     *
     * @returns A class reference object for System.Exception
     */
    static get Exception() {
        return classReference({
            name: "Exception",
            namespace: "System"
        });
    }
}
