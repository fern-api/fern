using System;

namespace SeedBytes;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBytesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
