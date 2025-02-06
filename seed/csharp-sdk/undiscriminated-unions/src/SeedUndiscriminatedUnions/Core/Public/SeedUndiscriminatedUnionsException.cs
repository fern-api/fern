using System;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedUndiscriminatedUnionsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
