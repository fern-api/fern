using System;

namespace SeedCsharpAccess;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpAccessException(string message, Exception? innerException = null)
    : Exception(message, innerException);
