namespace SeedApi;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedApiException(string message, Exception? innerException = null)
    : Exception(message, innerException);
