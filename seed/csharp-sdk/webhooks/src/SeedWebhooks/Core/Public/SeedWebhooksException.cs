namespace SeedWebhooks;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedWebhooksException(string message, Exception? innerException = null)
    : Exception(message, innerException);
