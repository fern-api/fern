namespace SeedUnions;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedUnionsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
