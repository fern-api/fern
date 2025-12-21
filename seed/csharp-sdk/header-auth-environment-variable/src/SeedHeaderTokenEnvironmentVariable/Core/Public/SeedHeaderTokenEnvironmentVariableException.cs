namespace SeedHeaderTokenEnvironmentVariable;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedHeaderTokenEnvironmentVariableException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
