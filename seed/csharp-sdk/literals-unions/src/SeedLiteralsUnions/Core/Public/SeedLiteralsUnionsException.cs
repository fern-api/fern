namespace SeedLiteralsUnions;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedLiteralsUnionsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
