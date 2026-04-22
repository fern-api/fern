namespace SeedWebsocketAuth;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedWebsocketAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException);
