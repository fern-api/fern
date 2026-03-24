namespace SeedWebsocketMultiUrl;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedWebsocketMultiUrlException(string message, Exception? innerException = null)
    : Exception(message, innerException);
