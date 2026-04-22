namespace SeedInferredAuthImplicitNoExpiry;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedInferredAuthImplicitNoExpiryException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
