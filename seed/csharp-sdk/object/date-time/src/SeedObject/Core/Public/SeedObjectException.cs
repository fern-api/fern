using System;

namespace SeedObject;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedObjectException(string message, Exception? innerException = null)
    : Exception(message, innerException);
