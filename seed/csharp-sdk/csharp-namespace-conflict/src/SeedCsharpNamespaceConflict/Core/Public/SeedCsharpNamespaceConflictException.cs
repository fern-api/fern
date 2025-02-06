using System;

namespace SeedCsharpNamespaceConflict;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpNamespaceConflictException(string message, Exception? innerException = null)
    : Exception(message, innerException);
