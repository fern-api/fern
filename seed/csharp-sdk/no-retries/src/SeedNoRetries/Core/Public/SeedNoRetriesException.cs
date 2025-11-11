namespace SeedNoRetries;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedNoRetriesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
