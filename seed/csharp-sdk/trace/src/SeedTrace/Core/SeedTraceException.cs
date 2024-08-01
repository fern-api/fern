using System;

#nullable enable

namespace SeedTrace.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedTraceException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
