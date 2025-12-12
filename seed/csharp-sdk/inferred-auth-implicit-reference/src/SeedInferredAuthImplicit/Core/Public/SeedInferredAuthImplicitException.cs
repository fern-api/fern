namespace SeedInferredAuthImplicit;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedInferredAuthImplicitException(string message, Exception? innerException = null)
    : Exception(message, innerException);
