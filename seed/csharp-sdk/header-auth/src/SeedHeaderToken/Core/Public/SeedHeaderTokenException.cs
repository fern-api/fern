namespace SeedHeaderToken;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedHeaderTokenException(string message, Exception? innerException = null)
    : Exception(message, innerException);
