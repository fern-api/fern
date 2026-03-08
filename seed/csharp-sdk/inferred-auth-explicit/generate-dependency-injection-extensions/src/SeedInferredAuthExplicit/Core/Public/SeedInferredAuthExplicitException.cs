namespace SeedInferredAuthExplicit;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedInferredAuthExplicitException(string message, Exception? innerException = null)
    : Exception(message, innerException);
