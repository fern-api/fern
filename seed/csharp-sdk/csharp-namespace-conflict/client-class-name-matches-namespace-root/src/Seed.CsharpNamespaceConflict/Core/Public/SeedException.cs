namespace Seed.CsharpNamespaceConflict;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedException(string message, Exception? innerException = null)
    : Exception(message, innerException);
