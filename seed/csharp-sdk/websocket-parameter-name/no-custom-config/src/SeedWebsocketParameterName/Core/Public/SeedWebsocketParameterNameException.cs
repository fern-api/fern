namespace SeedWebsocketParameterName;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedWebsocketParameterNameException(string message, Exception? innerException = null)
    : Exception(message, innerException);
