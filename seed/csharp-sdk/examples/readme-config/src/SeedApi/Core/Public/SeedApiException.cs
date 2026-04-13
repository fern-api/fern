namespace SeedApi;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedApiException(string message, global::System.Exception? innerException = null)
    : global::System.Exception(message, innerException);
