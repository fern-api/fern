namespace SeedOauthPkce;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedOauthPkceException(string message, Exception? innerException = null)
    : Exception(message, innerException);
