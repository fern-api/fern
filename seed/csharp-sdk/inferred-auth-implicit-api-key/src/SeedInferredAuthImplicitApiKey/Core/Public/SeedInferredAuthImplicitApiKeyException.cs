namespace SeedInferredAuthImplicitApiKey;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedInferredAuthImplicitApiKeyException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
