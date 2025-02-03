using System;

namespace SeedTrace;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedTraceException(string message, Exception? innerException = null)
    : Exception(message, innerException);
